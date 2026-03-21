// ─────────────────────────────────────────────────────────────
//  hashnodeService.js
//  Place this file at: src/services/hashnodeService.js
// ─────────────────────────────────────────────────────────────

const HASHNODE_API = "https://gql.hashnode.com";
const PUBLICATION_HOST = "anjaneyadealers.hashnode.dev";

// ─── Tag → Category mapping ───────────────────────────────────
const TAG_TO_CATEGORY = {
  "construction-tips": "Construction Tips",
  construction: "Construction Tips",
  "building-tips": "Construction Tips",
  building: "Construction Tips",

  "material-guide": "Material Guide",
  materials: "Material Guide",
  cement: "Material Guide",
  steel: "Material Guide",
  bricks: "Material Guide",
  roofing: "Material Guide",
  flooring: "Material Guide",
  sand: "Material Guide",

  "cost-saving": "Cost Saving",
  budget: "Cost Saving",
  "save-money": "Cost Saving",
  affordable: "Cost Saving",
  cost: "Cost Saving",

  "seasonal-tips": "Seasonal Tips",
  monsoon: "Seasonal Tips",
  summer: "Seasonal Tips",
  winter: "Seasonal Tips",
  weather: "Seasonal Tips",
  "rainy-season": "Seasonal Tips",

  "material-comparison": "Material Comparison",
  comparison: "Material Comparison",
  vs: "Material Comparison",
  versus: "Material Comparison",
  compare: "Material Comparison",

  "quality-control": "Quality Control",
  quality: "Quality Control",
  testing: "Quality Control",
  standards: "Quality Control",
  isp: "Quality Control",
  grade: "Quality Control",
};

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
                  author { name }
                }
              }
            }
          }
        }
      `,
    }),
  });

  const json = await res.json();
  console.log("[Hashnode] fetchAllPosts:", JSON.stringify(json, null, 2));

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
      bio: "Construction material experts in Bengaluru",
    },
  }));
}

// ─── Fetch single post by slug (used in BlogDetail.jsx) ───────
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
              tags { name slug }
              author { name }
            }
          }
        }
      `,
      variables: { slug },
    }),
  });

  const json = await res.json();
  console.log("[Hashnode] fetchPostBySlug:", JSON.stringify(json, null, 2));

  if (json.errors) throw new Error(json.errors[0].message);

  const node = json.data.publication.post;
  if (!node) return null;

  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    excerpt: node.brief || "",
    content: node.content.html,
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
      bio: "Construction material experts in Bengaluru",
    },
  };
}
