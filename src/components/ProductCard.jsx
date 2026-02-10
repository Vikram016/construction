import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="card overflow-hidden group animate-fade-in">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-construction-mediumGray">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-construction-yellow text-construction-darkGray px-3 py-1 font-bold text-xs uppercase">
          GST {product.gstPercentage}%
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-construction-orange font-bold uppercase tracking-wider mb-1">
          {product.category}
        </div>
        <h3 className="font-display text-xl text-construction-darkGray mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-construction-mediumGray mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-xs text-construction-mediumGray uppercase">Starting from</div>
            <div className="font-display text-3xl text-construction-darkGray">
              ₹{product.basePrice}
            </div>
            <div className="text-xs text-construction-mediumGray">per {product.unit}</div>
          </div>
        </div>

        {/* CTA */}
        <Link 
          to={`/product/${product.id}`}
          className="block w-full bg-construction-darkGray text-white text-center py-3 font-bold uppercase tracking-wider hover:bg-construction-yellow hover:text-construction-darkGray transition-all duration-300"
        >
          Get Quote
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
