import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogsData } from "../data/blogs";
import BlogCard from "../components/BlogCard";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import PageSEO from "../components/PageSEO";
import { PAGE_SEO, LOCAL_BUSINESS_SCHEMA, SITE } from "../config/seoConfig";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [allBlogs, setAllBlogs] = useState(blogsData); // start with static

  // Load from Firestore, fall back to static data
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(
          collection(db, "blogs"),
          where("isActive", "!=", false),
          orderBy("publishedAt", "desc"),
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (docs.length > 0) setAllBlogs(docs);
      } catch (e) {
        console.info("[Blog] Firestore unavailable — using static data");
      }
    };
    fetchBlogs();
  }, []);

  const categories = [
    "All",
    "Construction Tips",
    "Material Guide",
    "Cost Saving",
    "Seasonal Tips",
    "Material Comparison",
    "Quality Control",
  ];

  const filteredBlogs = allBlogs.filter((blog) => {
    const matchesCategory =
      selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredBlogs = allBlogs.filter((blog) => blog.featured);

  return (
    <>
      <PageSEO
        config={PAGE_SEO.blog}
        schemas={[LOCAL_BUSINESS_SCHEMA]}
        breadcrumbs={[
          { name: "Home", url: SITE.url },
          { name: "Blog", url: SITE.url + "/blog" },
        ]}
      />
      <div className="min-h-screen bg-neutral-50">
        {/* Hero Section */}
        <section className="bg-construction-dark text-white py-20">
          <div className="container-custom">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-black uppercase mb-6">
                BuildMart <span className="text-construction-yellow">Blog</span>
              </h1>
              <p className="text-xl text-neutral-300 mb-8">
                Expert insights on construction materials, tips, and industry
                best practices
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full px-6 py-4 bg-white border-3 border-construction-yellow text-neutral-900 font-semibold focus:outline-none"
                />
                <svg
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Blog */}
        {featuredBlogs.length > 0 &&
          selectedCategory === "All" &&
          !searchQuery && (
            <section className="py-16 border-b-4 border-construction-yellow">
              <div className="container-custom">
                <h2 className="text-3xl font-black uppercase mb-8 text-neutral-900">
                  Featured Article
                </h2>
                <Link
                  to={`/blog/${featuredBlogs[0].slug}`}
                  className="group grid md:grid-cols-2 gap-8 bg-white border-3 border-neutral-900 overflow-hidden construction-shadow hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <div className="aspect-video md:aspect-auto overflow-hidden">
                    <img
                      src={featuredBlogs[0].coverImage}
                      alt={featuredBlogs[0].title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className="bg-construction-yellow text-neutral-900 text-xs font-bold px-3 py-1 border-2 border-neutral-900 uppercase inline-block w-fit mb-4">
                      {featuredBlogs[0].category}
                    </span>
                    <h3 className="text-3xl font-black text-neutral-900 mb-4 group-hover:text-construction-yellow transition-colors uppercase">
                      {featuredBlogs[0].title}
                    </h3>
                    <p className="text-neutral-600 mb-6 line-clamp-3">
                      {featuredBlogs[0].excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span>{featuredBlogs[0].readTime}</span>
                      <span>•</span>
                      <span>{featuredBlogs[0].views} views</span>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          )}

        {/* Category Filter */}
        <section className="py-8 bg-white border-b-3 border-neutral-900 sticky top-16 z-40">
          <div className="container-custom">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 font-bold uppercase tracking-wider border-3 border-neutral-900 transition-all ${
                    selectedCategory === category
                      ? "bg-construction-yellow text-neutral-900"
                      : "bg-white text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16">
          <div className="container-custom">
            <div className="mb-6">
              <p className="text-neutral-600">
                Showing{" "}
                <span className="font-bold text-neutral-900">
                  {filteredBlogs.length}
                </span>{" "}
                articles
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {filteredBlogs.length === 0 ? (
              <div className="text-center py-20">
                <svg
                  className="w-20 h-20 mx-auto text-neutral-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  No articles found
                </h3>
                <p className="text-neutral-600 mb-6">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-construction-dark text-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-black uppercase mb-6">
              Need{" "}
              <span className="text-construction-yellow">
                Construction Materials?
              </span>
            </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Browse our products or contact us for expert advice on your
              construction needs
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/products" className="btn-primary text-lg">
                Browse Products
              </Link>
              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210"}?text=Hi! I need help with my construction project.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 border-3 border-neutral-900 uppercase tracking-wider transition-all text-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Blog;
