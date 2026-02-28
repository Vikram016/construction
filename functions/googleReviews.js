/**
 * googleReviews.js — Cloud Function to fetch Google Reviews
 *
 * Fetches reviews from Google Places API server-side (never expose API key in frontend).
 * Caches results in Firestore for 24 hours to minimise API calls.
 *
 * Deploy: firebase deploy --only functions
 *
 * Required Firebase Function config:
 *   firebase functions:config:set google.places_api_key="YOUR_KEY" google.place_id="YOUR_PLACE_ID"
 *
 * Or set environment variables in Firebase Console:
 *   GOOGLE_PLACES_API_KEY = your Google Places API key
 *   GOOGLE_PLACE_ID       = your Google Place ID (find at https://developers.google.com/maps/documentation/places/web-service/place-id)
 */

const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const axios = require('axios');

const CACHE_COLLECTION = 'cache';
const CACHE_DOC        = 'googleReviews';
const CACHE_TTL_MS     = 24 * 60 * 60 * 1000; // 24 hours

exports.getGoogleReviews = onRequest(
  {
    cors: true,          // allow calls from your Netlify domain
    secrets: [],         // using process.env
    timeoutSeconds: 15,
  },
  async (req, res) => {

    // ── CORS headers ─────────────────────────────────────────────────────────
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    const API_KEY  = process.env.GOOGLE_PLACES_API_KEY;
    const PLACE_ID = process.env.GOOGLE_PLACE_ID;

    if (!API_KEY || !PLACE_ID) {
      res.status(500).json({
        error: 'Google Places API not configured',
        message: 'Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID in Firebase Function config',
      });
      return;
    }

    const db = admin.firestore();

    try {
      // ── Check cache ───────────────────────────────────────────────────────
      const cacheRef  = db.collection(CACHE_COLLECTION).doc(CACHE_DOC);
      const cacheSnap = await cacheRef.get();

      if (cacheSnap.exists) {
        const cached = cacheSnap.data();
        const age    = Date.now() - cached.fetchedAt;
        if (age < CACHE_TTL_MS) {
          res.json({ reviews: cached.reviews, rating: cached.rating, totalRatings: cached.totalRatings, fromCache: true });
          return;
        }
      }

      // ── Fetch from Google Places API ──────────────────────────────────────
      const url = 'https://maps.googleapis.com/maps/api/place/details/json';
      const { data } = await axios.get(url, {
        params: {
          place_id: PLACE_ID,
          fields:   'name,rating,user_ratings_total,reviews',
          language: 'en',
          reviews_sort: 'newest',
          key: API_KEY,
        },
        timeout: 10000,
      });

      if (data.status !== 'OK') {
        throw new Error(`Google API error: ${data.status} — ${data.error_message || ''}`);
      }

      const place = data.result;

      // ── Normalise reviews ─────────────────────────────────────────────────
      const reviews = (place.reviews || [])
        .filter(r => r.rating >= 4)                 // only 4★ and 5★
        .slice(0, 6)                                 // max 6
        .map(r => ({
          author:      r.author_name,
          avatar:      r.profile_photo_url || null,
          rating:      r.rating,
          text:        r.text,
          time:        r.relative_time_description,  // "2 weeks ago"
          authorUrl:   r.author_url || null,
        }));

      const payload = {
        reviews,
        rating:       place.rating || 0,
        totalRatings: place.user_ratings_total || 0,
        fetchedAt:    Date.now(),
      };

      // ── Save to cache ─────────────────────────────────────────────────────
      await cacheRef.set(payload);

      res.json({ reviews: payload.reviews, rating: payload.rating, totalRatings: payload.totalRatings, fromCache: false });

    } catch (err) {
      console.error('[getGoogleReviews] error:', err.message);
      res.status(500).json({ error: 'Failed to fetch reviews', message: err.message });
    }
  }
);
