// src/hooks/useProducts.js
// Fetches from Firestore with automatic fallback to static productsData.
// This ensures pages like /product/cement-2 work even when:
//   - Firestore is empty (dev environment, not yet populated)
//   - The ID in the URL is a static data ID, not a Firestore document ID
//   - There is a Firestore connectivity error

import { useState, useEffect, useCallback } from 'react';
import { fetchActiveProducts, fetchAllProducts, fetchProductById } from '../services/productService';
import { productsData } from '../data/products';

// ─── hook: useProducts (list) ─────────────────────────────────────────────────

export const useProducts = (adminMode = false) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = adminMode
        ? await fetchAllProducts()
        : await fetchActiveProducts();

      // If Firestore returned products, use them — otherwise fall back to static
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        console.info('[useProducts] Firestore empty — using static productsData');
        setProducts(productsData);
      }
    } catch (err) {
      console.error('[useProducts] Firestore error — using static productsData:', err.message);
      setError(err.message);
      setProducts(productsData); // always show something
    } finally {
      setLoading(false);
    }
  }, [adminMode]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, loading, error, refetch: load };
};

// ─── hook: useProduct (single) ────────────────────────────────────────────────
// Priority:  1. Firestore by ID
//            2. Static productsData by ID  (catches cement-2, steel-1, etc.)

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);

      try {
        // 1️⃣ Try Firestore first
        const data = await fetchProductById(id);

        if (data) {
          setProduct(data);
        } else {
          // 2️⃣ Firestore returned null → look up in static data by ID
          const staticProduct = productsData.find((p) => p.id === id) || null;

          if (staticProduct) {
            console.info(`[useProduct] "${id}" not in Firestore — using static data`);
          } else {
            console.warn(`[useProduct] "${id}" not found in Firestore or static data`);
          }

          setProduct(staticProduct);
        }
      } catch (err) {
        console.error('[useProduct] Firestore error:', err.message);
        setError(err.message);

        // Still try static fallback so the page doesn't go blank
        const staticProduct = productsData.find((p) => p.id === id) || null;
        setProduct(staticProduct);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { product, loading, error };
};
