import './QuantitySelector.css';

const QuantitySelector = ({ quantity, onIncrease, onDecrease, min = 1 }) => {
  return (
    <div className="quantity-selector">
      <button
        className="quantity-btn quantity-btn-minus"
        onClick={onDecrease}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
      
      <div className="quantity-display">
        {quantity}
      </div>
      
      <button
        className="quantity-btn quantity-btn-plus"
        onClick={onIncrease}
        aria-label="Increase quantity"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  );
};

export default QuantitySelector;
