import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <div className="card h-full flex flex-col bg-white overflow-hidden group animate-fade-in hover:-translate-y-1 transition-all duration-300">
      {/* Image Section */}
      <div className="relative h-52 sm:h-60 overflow-hidden bg-construction-mediumGray">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-0 right-0 bg-construction-yellow text-construction-darkGray px-3 py-1 font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-sm z-10">
          GST {product.gstPercentage}%
        </div>
        {/* Subtle overlay gradient for better text contrast if needed later, or cleaner transition */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow relative">
        {/* Centered Header */}
        <div className="text-center pb-4 mb-4 border-b border-gray-100">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-construction-orange mb-2">
            {product.category}
          </div>
          <h3 className="font-display text-xl sm:text-2xl text-construction-darkGray leading-tight group-hover:text-construction-orange transition-colors duration-300">
            {product.name}
          </h3>
        </div>

        {/* Left-Aligned Details */}
        <div className="flex-grow text-left">
          <p className="text-sm text-construction-mediumGray mb-6 line-clamp-3 leading-relaxed">
            {product.description}
          </p>

          <div className="mb-6">
            <div className="text-[10px] sm:text-xs text-construction-mediumGray uppercase tracking-wide font-medium mb-1">
              Starting from
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl sm:text-4xl text-construction-darkGray tracking-tight">
                ₹{product.basePrice}
              </span>
              <span className="text-xs text-construction-mediumGray font-medium">
                / {product.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/product/${product.id}`}
          className="w-full bg-construction-darkGray text-white text-center py-3.5 sm:py-4 font-bold uppercase tracking-wider text-sm sm:text-base hover:bg-construction-yellow hover:text-construction-darkGray transition-all duration-300 shadow-md hover:shadow-lg mt-auto"
        >
          Get Quote
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
