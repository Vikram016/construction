import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-xl transition-all"
    >
      <div className="aspect-square bg-neutral-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="text-xs text-primary-500 font-medium mb-1 uppercase">
          {product.category}
        </div>
        <h3 className="font-semibold text-neutral-900 mb-2 group-hover:text-primary-500 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500">Starting from</div>
            <div className="text-xl font-bold text-neutral-900">
              ₹{product.basePrice}
              <span className="text-sm font-normal text-neutral-500">/{product.unit}</span>
            </div>
          </div>
          <div className="badge-success text-xs">In Stock</div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
