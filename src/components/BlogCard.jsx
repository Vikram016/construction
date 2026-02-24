import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group bg-white border-3 border-neutral-900 overflow-hidden construction-shadow hover:translate-x-1 hover:translate-y-1 transition-all"
    >
      {/* Image */}
      <div className="aspect-video overflow-hidden border-b-3 border-neutral-900">
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-construction-yellow text-neutral-900 text-xs font-bold px-3 py-1 border-2 border-neutral-900 uppercase">
            {blog.category}
          </span>
          <span className="text-sm text-neutral-600">{blog.readTime}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-neutral-900 mb-3 group-hover:text-construction-yellow transition-colors uppercase line-clamp-2">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-neutral-600 mb-4 line-clamp-3">
          {blog.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-construction-yellow border-2 border-neutral-900 flex items-center justify-center font-bold text-neutral-900">
              {blog.author.name.charAt(0)}
            </div>
            <div className="text-sm">
              <p className="font-bold text-neutral-900">{blog.author.name}</p>
              <p className="text-neutral-500 text-xs">{formatDate(blog.publishedAt)}</p>
            </div>
          </div>

          {/* Views */}
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {blog.views}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
