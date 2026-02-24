/**
 * PageSEO.jsx — Drop-in SEO component for every page.
 *
 * Usage:
 *   import PageSEO from '../components/PageSEO';
 *   import { PAGE_SEO, GEO, LOCAL_BUSINESS_SCHEMA } from '../config/seoConfig';
 *
 *   <PageSEO
 *     config={PAGE_SEO.home}
 *     schemas={[LOCAL_BUSINESS_SCHEMA, websiteSchema]}
 *     breadcrumbs={[{ name: 'Home', url: 'https://buildmart.in' }]}
 *   />
 *
 * Props:
 *   config      — from PAGE_SEO.xxx  (title, description, keywords, canonical, og)
 *   schemas     — JSON-LD array (LocalBusiness, Service, FAQPage, BreadcrumbList…)
 *   breadcrumbs — [{name, url}] — auto-generates BreadcrumbList schema
 *   noindex     — boolean — set true for admin/login pages
 */

import { Helmet } from 'react-helmet-async';
import { SITE, GEO } from '../config/seoConfig';

const PageSEO = ({ config, schemas = [], breadcrumbs = [], noindex = false }) => {
  if (!config) return null;

  const { title, description, keywords, canonical, og } = config;

  /* Auto-build BreadcrumbList schema from breadcrumbs prop */
  const breadcrumbSchema = breadcrumbs.length > 0 ? {
    '@context':       'https://schema.org',
    '@type':          'BreadcrumbList',
    itemListElement:  breadcrumbs.map((crumb, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      name:       crumb.name,
      item:       crumb.url,
    })),
  } : null;

  const allSchemas = [
    ...schemas,
    ...(breadcrumbSchema ? [breadcrumbSchema] : []),
  ];

  return (
    <Helmet>
      {/* ── Core ── */}
      <html lang="en"/>
      <title>{title}</title>
      <meta name="description"  content={description}/>
      {keywords && <meta name="keywords" content={keywords}/>}
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'}/>
      {canonical && <link rel="canonical" href={canonical}/>}

      {/* ── Open Graph ── */}
      <meta property="og:type"        content="website"/>
      <meta property="og:title"       content={og?.title || title}/>
      <meta property="og:description" content={og?.description || description}/>
      <meta property="og:url"         content={canonical || SITE.url}/>
      <meta property="og:site_name"   content={SITE.name}/>
      {og?.image && <meta property="og:image" content={og.image}/>}
      <meta property="og:locale"      content="en_IN"/>

      {/* ── Twitter Card ── */}
      <meta name="twitter:card"        content="summary_large_image"/>
      <meta name="twitter:title"       content={og?.title || title}/>
      <meta name="twitter:description" content={og?.description || description}/>
      {og?.image && <meta name="twitter:image" content={og.image}/>}

      {/* ── Geo meta — local search signals ── */}
      <meta name="geo.region"    content={GEO.stateCode}/>
      <meta name="geo.placename" content={`${GEO.city}, ${GEO.state}, ${GEO.country}`}/>
      <meta name="geo.position"  content={`${GEO.lat};${GEO.lng}`}/>
      <meta name="ICBM"          content={`${GEO.lat}, ${GEO.lng}`}/>

      {/* ── JSON-LD schemas ── */}
      {allSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default PageSEO;
