import { useState } from 'react';
import './CalculatorForm.css';

const CalculatorForm = ({ onCalculate, location, onLocationChange, loading }) => {
  const [plotArea, setPlotArea] = useState('');
  const [floors, setFloors] = useState(1);
  const [constructionType, setConstructionType] = useState('standard');
  const [includeGST, setIncludeGST] = useState(true);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!plotArea || parseFloat(plotArea) <= 0) {
      newErrors.plotArea = 'Plot area must be greater than 0';
    }
    if (parseFloat(plotArea) > 50000) {
      newErrors.plotArea = 'Plot area seems too large. Please verify.';
    }
    if (floors < 1 || floors > 10) {
      newErrors.floors = 'Floors must be between 1 and 10';
    }
    if (!constructionType) {
      newErrors.constructionType = 'Please select construction type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const formData = {
      plotArea: parseFloat(plotArea),
      floors: parseInt(floors),
      constructionType,
      includeGST
    };

    onCalculate(formData);
  };

  return (
    <div className="calculator-form-container">
      <div className="calculator-form-card">
        {/* Location Display */}
        <div className="location-display">
          <div className="location-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="location-text">
            {loading ? (
              <span>Detecting your location...</span>
            ) : location ? (
              <>
                <span className="location-label">Delivering to:</span>
                <span className="location-value">{location.city || 'Unknown City'}</span>
                {location.pincode && <span className="location-pincode">({location.pincode})</span>}
              </>
            ) : (
              <span>Location not available</span>
            )}
          </div>
          <button 
            type="button" 
            className="location-change-btn"
            onClick={onLocationChange}
          >
            Change
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="calculator-form">
          <h2 className="form-title">Calculate Your Construction Cost</h2>

          {/* Plot Area */}
          <div className="form-group">
            <label htmlFor="plotArea" className="form-label">
              Plot Area (sq.ft) *
            </label>
            <input
              type="number"
              id="plotArea"
              value={plotArea}
              onChange={(e) => setPlotArea(e.target.value)}
              placeholder="Enter plot area"
              className={`form-input ${errors.plotArea ? 'error' : ''}`}
              step="0.01"
              min="0"
            />
            {errors.plotArea && <span className="error-message">{errors.plotArea}</span>}
          </div>

          {/* Number of Floors */}
          <div className="form-group">
            <label htmlFor="floors" className="form-label">
              Number of Floors *
            </label>
            <select
              id="floors"
              value={floors}
              onChange={(e) => setFloors(parseInt(e.target.value))}
              className={`form-select ${errors.floors ? 'error' : ''}`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num} Floor{num > 1 ? 's' : ''}</option>
              ))}
            </select>
            {errors.floors && <span className="error-message">{errors.floors}</span>}
          </div>

          {/* Construction Type */}
          <div className="form-group">
            <label className="form-label">Construction Type *</label>
            <div className="radio-group">
              <label className={`radio-card ${constructionType === 'basic' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="constructionType"
                  value="basic"
                  checked={constructionType === 'basic'}
                  onChange={(e) => setConstructionType(e.target.value)}
                />
                <div className="radio-content">
                  <span className="radio-title">Basic</span>
                  <span className="radio-price">₹1,600/sq.ft</span>
                  <span className="radio-desc">Standard materials & finishes</span>
                </div>
              </label>

              <label className={`radio-card ${constructionType === 'standard' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="constructionType"
                  value="standard"
                  checked={constructionType === 'standard'}
                  onChange={(e) => setConstructionType(e.target.value)}
                />
                <div className="radio-content">
                  <span className="radio-title">Standard</span>
                  <span className="radio-price">₹1,900/sq.ft</span>
                  <span className="radio-desc">Good quality materials</span>
                </div>
              </label>

              <label className={`radio-card ${constructionType === 'premium' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="constructionType"
                  value="premium"
                  checked={constructionType === 'premium'}
                  onChange={(e) => setConstructionType(e.target.value)}
                />
                <div className="radio-content">
                  <span className="radio-title">Premium</span>
                  <span className="radio-price">₹2,200/sq.ft</span>
                  <span className="radio-desc">High-end materials & finishes</span>
                </div>
              </label>
            </div>
            {errors.constructionType && <span className="error-message">{errors.constructionType}</span>}
          </div>

          {/* GST Checkbox */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeGST}
                onChange={(e) => setIncludeGST(e.target.checked)}
                className="form-checkbox"
              />
              <span>Include GST (18%)</span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="calculate-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Calculate Cost
          </button>
        </form>
      </div>
    </div>
  );
};

export default CalculatorForm;
