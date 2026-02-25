import { useParams, Link } from 'react-router-dom';
import { blogsData } from '../data/blogs';
import BlogCard from '../components/BlogCard';

const BlogDetail = () => {
  const { slug } = useParams();
  const blog = blogsData.find(b => b.slug === slug);

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Blog Post Not Found</h2>
          <Link to="/blog" className="btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const relatedBlogs = blogsData
    .filter(b => b.category === blog.category && b.id !== blog.id)
    .slice(0, 3);

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out this article: ${blog.title}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b-2 border-neutral-200 py-4">
        <div className="container-custom">
          <div className="flex items-center text-sm text-neutral-600">
            <Link to="/" className="hover:text-construction-yellow">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-construction-yellow">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900 font-medium line-clamp-1">{blog.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 bg-white border-b-4 border-construction-yellow">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Category Badge */}
            <span className="inline-block bg-construction-yellow text-neutral-900 text-sm font-bold px-4 py-2 border-2 border-neutral-900 uppercase mb-6">
              {blog.category}
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 uppercase leading-tight">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-neutral-600">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-construction-yellow border-3 border-neutral-900 flex items-center justify-center font-bold text-neutral-900 text-xl">
                  {blog.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{blog.author.name}</p>
                  <p className="text-sm">{blog.author.bio}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(blog.publishedAt)}
                </span>
                <span>•</span>
                <span>{blog.readTime}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {blog.views} views
                </span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={shareOnWhatsApp}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 border-3 border-neutral-900 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      <section className="py-8">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full border-3 border-neutral-900 construction-shadow"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div 
              className="prose prose-lg max-w-none blog-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <section className="py-16 bg-white border-t-4 border-construction-yellow">
          <div className="container-custom">
            <h2 className="text-3xl font-black uppercase mb-8 text-neutral-900">
              Related Articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedBlogs.map(relatedBlog => (
                <BlogCard key={relatedBlog.id} blog={relatedBlog} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-construction-dark text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-black uppercase mb-6">
            Need <span className="text-construction-yellow">Construction Materials?</span>
          </h2>
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            Get the best quality materials delivered to your site
          </p>
          <Link to="/products" className="btn-primary text-lg">
            Browse Products
          </Link>
        </div>
      </section>

      {/* Blog Content Styles */}
      <style jsx>{`
        .blog-content h2 {
          font-size: 1.875rem;
          font-weight: 900;
          text-transform: uppercase;
          color: #1a1a1a;
          margin-top: 2rem;
          margin-bottom: 1rem;
          border-bottom: 4px solid #FDB913;
          padding-bottom: 0.5rem;
        }

        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1a1a1a;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .blog-content p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
          color: #404040;
        }

        .blog-content ul, .blog-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
          color: #404040;
        }

        .blog-content strong {
          font-weight: 700;
          color: #1a1a1a;
        }

        .blog-content ul {
          list-style-type: disc;
        }

        .blog-content ol {
          list-style-type: decimal;
        }
      `}</style>
    </div>
    </div>
  );
};

export default BlogDetail;
