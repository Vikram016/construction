/**
 * CloudinaryImage — Smart image component for BuildMart
 *
 * Handles:
 *  • Cloudinary public IDs  → optimized URL with auto format/quality/resize
 *  • Full Cloudinary URLs   → passed through (already optimized or from Firestore)
 *  • Unsplash / other URLs  → passed through as-is (legacy / static data)
 *  • Blur-up loading        → tiny 20px placeholder fades into full image
 *  • Error fallback         → shows a branded placeholder on broken images
 *  • Native lazy loading    → browser-native loading="lazy"
 */

import { useState, useRef } from 'react';
import { CLOUDINARY_CONFIG } from '../config/cloudinaryConfig';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

/**
 * Build an optimized Cloudinary URL.
 * Accepts either a bare publicId ("products/cement-bag") or a full
 * res.cloudinary.com URL (extracts the publicId automatically).
 *
 * @param {string} src       – publicId or any URL
 * @param {object} opts
 * @param {number} [opts.w]          – pixel width
 * @param {number} [opts.h]          – pixel height
 * @param {string} [opts.crop]       – 'fill' | 'fit' | 'thumb' | 'pad' …
 * @param {string} [opts.gravity]    – 'auto' | 'face' | 'center' …
 * @param {string} [opts.quality]    – 'auto' | 'auto:good' | 'auto:eco' | '80'
 * @param {string} [opts.format]     – 'auto' | 'webp' | 'avif' | 'jpg'
 * @param {number} [opts.blur]       – 1–2000 (for placeholder blur)
 * @returns {string}
 */
const buildCloudinaryUrl = (src, opts = {}) => {
  const cloudName = CLOUDINARY_CONFIG.cloudName;
  if (!cloudName || !src) return src || '';

  const {
    w       = null,
    h       = null,
    crop    = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format  = 'auto',
    blur    = null,
  } = opts;

  // Detect if src is already a full Cloudinary URL
  const cloudinaryBase = `https://res.cloudinary.com/${cloudName}/image/upload/`;
  let publicId = src;

  if (src.startsWith(cloudinaryBase)) {
    // Strip the base + any existing transformation segment
    const remainder = src.slice(cloudinaryBase.length);
    // If there's a transformation block (contains '/'), split it off
    const slashIdx = remainder.indexOf('/');
    publicId = slashIdx !== -1 ? remainder.slice(slashIdx + 1) : remainder;
  } else if (src.startsWith('http') && !src.includes('res.cloudinary.com')) {
    // External URL (Unsplash, Firebase Storage, etc.) — return as-is
    return src;
  }

  // Build transformation string
  const transforms = [`f_${format}`, `q_${quality}`];
  if (w)       transforms.push(`w_${w}`);
  if (h)       transforms.push(`h_${h}`);
  if (w || h)  transforms.push(`c_${crop}`, `g_${gravity}`);
  if (blur)    transforms.push(`e_blur:${blur}`);

  return `${cloudinaryBase}${transforms.join(',')}/${publicId}`;
};

/**
 * Generate a tiny 20px wide placeholder (blurred) for blur-up effect.
 */
const buildPlaceholderUrl = (src) =>
  buildCloudinaryUrl(src, { w: 20, quality: '10', format: 'jpg', blur: 200 });

/* ─── fallback SVG placeholder ───────────────────────────────────────────── */
const FallbackPlaceholder = ({ className = '', label = 'Image' }) => (
  <div
    className={`flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 ${className}`}
    aria-label={label}
  >
    <svg className="w-12 h-12 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
    <span className="text-xs font-medium">{label}</span>
  </div>
);

/* ─── main component ──────────────────────────────────────────────────────── */

/**
 * @param {object} props
 * @param {string}  props.src          – Cloudinary publicId OR any image URL
 * @param {string}  props.alt          – alt text
 * @param {number}  [props.width]      – desired pixel width for URL transform
 * @param {number}  [props.height]     – desired pixel height for URL transform
 * @param {string}  [props.crop]       – Cloudinary crop mode (default: 'fill')
 * @param {string}  [props.quality]    – Cloudinary quality (default: 'auto')
 * @param {string}  [props.format]     – Cloudinary format (default: 'auto')
 * @param {boolean} [props.blurUp]     – enable blur-up placeholder (default: true)
 * @param {string}  [props.className]  – extra CSS classes on the <img>
 * @param {string}  [props.fallback]   – label shown in FallbackPlaceholder
 * @param {string}  [props.loading]    – 'lazy' | 'eager' (default: 'lazy')
 * @param {string}  [props.sizes]      – HTML sizes attribute for responsive images
 */
const CloudinaryImage = ({
  src,
  alt = '',
  width = null,
  height = null,
  crop = 'fill',
  quality = 'auto',
  format = 'auto',
  blurUp = true,
  className = '',
  fallback = 'No Image',
  loading = 'lazy',
  sizes = null,
  ...rest
}) => {
  const [loaded, setLoaded]   = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef                = useRef(null);

  if (!src) return <FallbackPlaceholder className={className} label={fallback} />;

  const optimizedSrc   = buildCloudinaryUrl(src, { w: width, h: height, crop, quality, format });
  const placeholderSrc = blurUp ? buildPlaceholderUrl(src) : null;

  if (errored) return <FallbackPlaceholder className={className} label={fallback} />;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ display: 'contents' }}>
      {/* Blur placeholder — shown until main image loads */}
      {blurUp && !loaded && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover scale-110 blur-sm ${className}`}
          style={{ filter: 'blur(8px)', transform: 'scale(1.1)' }}
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        loading={loading}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`
          ${className}
          transition-opacity duration-500
          ${loaded ? 'opacity-100' : 'opacity-0'}
        `}
        {...rest}
      />
    </div>
  );
};

/* ─── preset variants for common use cases ───────────────────────────────── */

/** Square product card thumbnail (300×300, fill) */
export const ProductThumbnail = ({ src, alt, className = '', ...props }) => (
  <CloudinaryImage
    src={src}
    alt={alt}
    width={300}
    height={300}
    crop="fill"
    quality="auto:good"
    className={`w-full h-full object-cover ${className}`}
    {...props}
  />
);

/** Full-width product detail image (800px wide) */
export const ProductHeroImage = ({ src, alt, className = '', ...props }) => (
  <CloudinaryImage
    src={src}
    alt={alt}
    width={800}
    quality="auto:best"
    crop="fit"
    className={`w-full h-full object-cover ${className}`}
    loading="eager"
    {...props}
  />
);

/** Category card image (400×400, fill) */
export const CategoryImage = ({ src, alt, className = '', ...props }) => (
  <CloudinaryImage
    src={src}
    alt={alt}
    width={400}
    height={400}
    crop="fill"
    gravity="auto"
    quality="auto:good"
    className={`w-full h-full object-cover ${className}`}
    {...props}
  />
);

/** Cart / drawer thumbnail (80×80) */
export const CartThumbnail = ({ src, alt, className = '', ...props }) => (
  <CloudinaryImage
    src={src}
    alt={alt}
    width={80}
    height={80}
    crop="fill"
    quality="auto:eco"
    blurUp={false}
    className={`w-full h-full object-cover ${className}`}
    {...props}
  />
);

export default CloudinaryImage;
