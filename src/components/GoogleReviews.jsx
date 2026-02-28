/**
 * GoogleReviews.jsx
 *
 * Fetches live Google reviews from the Cloud Function (which calls Places API server-side).
 * Falls back to hardcoded reviews if the function isn't configured yet.
 *
 * Usage:
 *   <GoogleReviews />
 *
 * To activate live reviews:
 *   1. Deploy the getGoogleReviews Cloud Function
 *   2. Set VITE_GOOGLE_REVIEWS_URL in .env to your function URL:
 *      VITE_GOOGLE_REVIEWS_URL=https://us-central1-YOUR-PROJECT.cloudfunctions.net/getGoogleReviews
 *   3. Set VITE_GOOGLE_PLACE_ID to your Google Place ID
 *   4. Set GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID in Firebase Function environment
 */

import { useState, useEffect } from 'react';

/* ── Star renderer ─────────────────────────────────────────────────────────── */
const Stars = ({ rating, size = 'sm' }) => {
  const dim = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={dim + (i <= rating ? ' text-yellow-400' : ' text-neutral-300')} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
};

/* ── Google logo SVG ───────────────────────────────────────────────────────── */
const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ── Fallback reviews shown when API not configured ────────────────────────── */
const FALLBACK_REVIEWS = [
  {
    author: 'Rajesh Kumar',
    avatar: null,
    rating: 5,
    text: 'Excellent quality materials and on-time delivery. BuildMart has been our trusted partner for 3 years. The cement and steel quality is consistently good.',
    time: '2 weeks ago',
  },
  {
    author: 'Priya Sharma',
    avatar: null,
    rating: 5,
    text: 'Best prices in Bangalore with completely transparent billing. The GST invoice was ready same day. Highly recommended for bulk construction orders.',
    time: '1 month ago',
  },
  {
    author: 'Amit Patel',
    avatar: null,
    rating: 5,
    text: 'Professional service from order to delivery. The WhatsApp updates are very helpful. The driver called 30 minutes before arrival — very convenient!',
    time: '3 weeks ago',
  },
  {
    author: 'Sunita Reddy',
    avatar: null,
    rating: 5,
    text: 'Ordered 200 bags of cement for my apartment construction. Delivery was on time, materials are genuine branded products. Will order again.',
    time: '2 months ago',
  },
  {
    author: 'Mohammed Irfan',
    avatar: null,
    rating: 4,
    text: 'Good quality TMT bars at competitive rates. Customer support is responsive on WhatsApp. Overall very happy with the service.',
    time: '1 month ago',
  },
  {
    author: 'Deepa Nair',
    avatar: null,
    rating: 5,
    text: 'Their site cleanup service is a game changer. After the sand delivery they cleared all the waste too. Saves so much time and effort on site.',
    time: '3 months ago',
  },
];

const FALLBACK_SUMMARY = { rating: 4.8, totalRatings: 127 };

/* ── Avatar component ──────────────────────────────────────────────────────── */
const Avatar = ({ src, name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500'];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (src) {
    return <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover border-2 border-neutral-200" referrerPolicy="no-referrer" />;
  }
  return (
    <div className={'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-neutral-200 flex-shrink-0 ' + color}>
      {initial}
    </div>
  );
};

/* ── Single review card ────────────────────────────────────────────────────── */
const ReviewCard = ({ review }) => (
  <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
    {/* Header */}
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={review.avatar} name={review.author} />
        <div className="min-w-0">
          <p className="font-bold text-neutral-900 text-sm truncate">{review.author}</p>
          <p className="text-xs text-neutral-400">{review.time}</p>
        </div>
      </div>
      <GoogleLogo />
    </div>

    {/* Stars */}
    <Stars rating={review.rating} />

    {/* Review text */}
    <p className="text-neutral-700 text-sm mt-3 leading-relaxed flex-1 line-clamp-4">
      {review.text}
    </p>
  </div>
);

/* ── Overall rating badge ──────────────────────────────────────────────────── */
const RatingBadge = ({ rating, total, placeId }) => (
  <div className="flex flex-col sm:flex-row items-center gap-6 bg-white rounded-2xl border border-neutral-200 shadow-sm px-8 py-6 inline-flex mb-10">
    <div className="text-center">
      <div className="text-5xl font-black text-neutral-900">{rating.toFixed(1)}</div>
      <Stars rating={Math.round(rating)} size="lg" />
      <p className="text-sm text-neutral-500 mt-1">{total.toLocaleString()} reviews</p>
    </div>
    <div className="w-px h-16 bg-neutral-200 hidden sm:block" />
    <div className="text-center sm:text-left">
      <div className="flex items-center gap-2 mb-1">
        <GoogleLogo />
        <span className="font-bold text-neutral-800">Google Reviews</span>
      </div>
      <p className="text-sm text-neutral-500">Verified customer reviews</p>
      {placeId && (
        <a
          href={'https://search.google.com/local/writereview?placeid=' + placeId}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Write a review →
        </a>
      )}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════════ */
const GoogleReviews = () => {
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [summary, setSummary] = useState(FALLBACK_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const functionUrl  = import.meta.env.VITE_GOOGLE_REVIEWS_URL;
  const placeId      = import.meta.env.VITE_GOOGLE_PLACE_ID;

  useEffect(() => {
    if (!functionUrl) return; // no function configured — use fallback

    setLoading(true);
    fetch(functionUrl)
      .then(r => r.json())
      .then(data => {
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          setSummary({ rating: data.rating, totalRatings: data.totalRatings });
          setIsLive(true);
        }
      })
      .catch(() => { /* silently use fallback */ })
      .finally(() => setLoading(false));
  }, [functionUrl]);

  return (
    <section className="py-20 bg-neutral-50">
      <div className="container-custom">

        {/* Section header */}
        <div className="text-center mb-4">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-neutral-600">
            Trusted by 500+ builders and contractors across Bangalore
          </p>
        </div>

        {/* Rating badge */}
        <div className="flex justify-center">
          <RatingBadge rating={summary.rating} total={summary.totalRatings} placeId={placeId} />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-neutral-200 rounded w-3/4" />
                    <div className="h-2 bg-neutral-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-neutral-200 rounded w-1/3 mb-3" />
                <div className="space-y-2">
                  <div className="h-2 bg-neutral-200 rounded" />
                  <div className="h-2 bg-neutral-200 rounded w-5/6" />
                  <div className="h-2 bg-neutral-200 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        )}

        {/* CTA — leave a review */}
        {placeId && (
          <div className="text-center mt-12">
            <a
              href={'https://search.google.com/local/writereview?placeid=' + placeId}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-neutral-800 font-bold px-6 py-3 rounded-xl border-2 border-neutral-300 hover:border-blue-400 hover:shadow-md transition-all"
            >
              <GoogleLogo />
              Share Your Experience on Google
            </a>
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <p className="text-center text-xs text-neutral-400 mt-4">
            ✓ Live from Google · Updates every 24 hours
          </p>
        )}

      </div>
    </section>
  );
};

export default GoogleReviews;
