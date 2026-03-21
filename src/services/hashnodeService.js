// ─────────────────────────────────────────────────────────────
//  hashnodeService.js
//  Place this file at: src/services/hashnodeService.js
//
//  SETUP:
//  1. Change PUBLICATION_HOST to your Hashnode publication URL
//     e.g. "anjaneyadealers.hashnode.dev"
//  2. In Blog.jsx and BlogDetail.jsx replace the Firestore
//     useEffect with the ones shown at the bottom of this file.
// ─────────────────────────────────────────────────────────────

const HASHNODE_API = "https://gql.hashnode.com";
const PUBLICATION_HOST = "anjaneyadealers.hashnode.dev"; // 🔁 change this to your Hashnode URL

// ─── Tag → Category mapping ───────────────────────────────────
// When writing a post on Hashnode, add a tag matching the left
// column. The mapper picks the FIRST matching tag as category.
const TAG_TO_CATEGORY = {
  // Construction Tips
  "construction-tips": "Construction Tips",
  construction: "Construction Tips",
  "building-tips": "Construction Tips",
  building: "Construction Tips",

  // Material Guide
  "material-guide": "Material Guide",
  materials: "Material Guide",
  cement: "Material Guide",
  steel: "Material Guide",
  bricks: "Material Guide",
  roofing: "Material Guide",
  flooring: "Material Guide",
  sand: "Material Guide",

  // Cost Saving
  "cost-saving": "Cost Saving",
  budget: "Cost Saving",
  "save-money": "Cost Saving",
  affordable: "Cost Saving",
  cost: "Cost Saving",

  // Seasonal Tips
  "seasonal-tips": "Seasonal Tips",
  monsoon: "Seasonal Tips",
  summer: "Seasonal Tips",
  winter: "Seasonal Tips",
  weather: "Seasonal Tips",
  "rainy-season": "Seasonal Tips",

  // Material Comparison
  "material-comparison": "Material Comparison",
  comparison: "Material Comparison",
  vs: "Material Comparison",
  versus: "Material Comparison",
  compare: "Material Comparison",

  // Quality Control
  "quality-control": "Quality Control",
  quality: "Quality Control",
  testing: "Quality Control",
  standards: "Quality Control",
  isp: "Quality Control",
  grade: "Quality Control",
};

// Maps the first matching Hashnode tag to one of your site categories.
// Falls back to "Construction Tips" if no tag matches.
function mapTagsToCategory(tags = []) {
  for (const tag of tags) {
    const bySlug = TAG_TO_CATEGORY[tag.slug?.toLowerCase()];
    if (bySlug) return bySlug;

    const byName =
      TAG_TO_CATEGORY[tag.name?.toLowerCase().replace(/\s+/g, "-")];
    if (byName) return byName;
  }
  return "Construction Tips";
}

// ─── Fetch all posts (used in Blog.jsx) ───────────────────────
export async function fetchAllPosts() {
  const res = await fetch(HASHNODE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetAllPosts {
          publication(host: "${PUBLICATION_HOST}") {
            posts(first: 20) {
              edges {
                node {
                  id
                  title
                  slug
                  brief
                  coverImage { url }
                  publishedAt
                  readTimeInMinutes
                  tags { name slug }
                  author { name  }
                }
              }
            }
          }
        }
      `,
    }),
  });

  const json = await res.json();

  // Log full response so we can see what Hashnode returns
  console.log(
    "[Hashnode] fetchAllPosts response:",
    JSON.stringify(json, null, 2),
  );

  if (json.errors) throw new Error(json.errors[0].message);

  return json.data.publication.posts.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    slug: node.slug,
    excerpt: node.brief || "",
    coverImage:
      node.coverImage?.url ||
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    publishedAt: node.publishedAt,
    readTime: `${node.readTimeInMinutes} min read`,
    views: 0,
    featured: false,
    isActive: true,
    category: mapTagsToCategory(node.tags),
    author: {
      name: node.author?.name || "Anjaneya Dealers",
      bio: node.author?.bio || "Construction material experts in Bengaluru",
    },
  }));
}

// ─── Fetch a single post by slug (used in BlogDetail.jsx) ─────
export async function fetchPostBySlug(slug) {
  const res = await fetch(HASHNODE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetPost($slug: String!) {
          publication(host: "${PUBLICATION_HOST}") {
            post(slug: $slug) {
              id
              title
              slug
              brief
              content { html }
              coverImage { url }
              publishedAt
              readTimeInMinutes
              views
              tags { name slug }
              author { name  }
            }
          }
        }
      `,
      variables: { slug },
    }),
  });

  if (!res.ok) throw new Error(`Hashnode API error: ${res.status}`);

  const { data, errors } = await res.json();
  if (errors) throw new Error(errors[0].message);

  const node = data.publication.post;
  if (!node) return null;

  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    excerpt: node.brief || "",
    content: node.content.html, // ready for dangerouslySetInnerHTML
    coverImage:
      node.coverImage?.url ||
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    publishedAt: node.publishedAt,
    readTime: `${node.readTimeInMinutes} min read`,
    views: node.views || 0,
    featured: false,
    isActive: true,
    category: mapTagsToCategory(node.tags),
    author: {
      name: node.author?.name || "Anjaneya Dealers",
      bio: node.author?.bio || "Construction material experts in Bengaluru",
    },
  };
}

// ─────────────────────────────────────────────────────────────
//  COPY THESE useEffect REPLACEMENTS INTO YOUR COMPONENTS
// ─────────────────────────────────────────────────────────────

// ── Blog.jsx ─────────────────────────────────────────────────
//
// 1. Add this import at the top of Blog.jsx:
//    import { fetchAllPosts } from "../services/hashnodeService";
//
// 2. Replace your existing useEffect with:
//
//    useEffect(() => {
//      const load = async () => {
//        try {
//          const posts = await fetchAllPosts();
//          if (posts.length > 0) setAllBlogs(posts);
//        } catch (e) {
//          console.info("[Blog] Hashnode unavailable — using static data");
//        }
//      };
//      load();
//    }, []);
//
// 3. Remove these unused imports from Blog.jsx:
//    import { db } from "../firebase/firebaseConfig";
//    import { collection, getDocs, query, orderBy, where } from "firebase/firestore";

// ── BlogDetail.jsx ────────────────────────────────────────────
//
// 1. Add this import at the top of BlogDetail.jsx:
//    import { fetchPostBySlug } from "../services/hashnodeService";
//
// 2. Replace your existing useEffect with:
//
//    useEffect(() => {
//      const load = async () => {
//        try {
//          const post = await fetchPostBySlug(slug);
//          if (post) setBlog(post);
//        } catch (e) {
//          console.info("[BlogDetail] Hashnode unavailable — using static data");
//        } finally {
//          setLoading(false);
//        }
//      };
//      load();
//    }, [slug]);
//
// 3. Remove these unused imports from BlogDetail.jsx:
//    import { db } from "../firebase/firebaseConfig";
//    import { collection, getDocs, query, orderBy, where } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────
//  QUICK TEST — paste in browser console on your site:
//
//  fetch("https://gql.hashnode.com", {
//    method: "POST",
//    headers: { "Content-Type": "application/json" },
//    body: JSON.stringify({
//      query: `{ publication(host: "anjaneyadealers.hashnode.dev") {
//        posts(first: 3) { edges { node { title tags { name slug } } } }
//      }}`
//    })
//  }).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
// ─────────────────────────────────────────────────────────────
