import { useState, useCallback } from 'react';

export const useDistanceCalculator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDistance = useCallback(async (destinationAddress) => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const warehouseLat = import.meta.env.VITE_WAREHOUSE_LAT || '28.6139';
      const warehouseLng = import.meta.env.VITE_WAREHOUSE_LNG || '77.2090';

      if (!apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const origin = `${warehouseLat},${warehouseLng}`;
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destinationAddress)}&key=${apiKey}`;

      // Note: In production, this should be proxied through your backend to hide API key
      // For demo purposes, we'll use a mock calculation
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch distance data');
      }

      const data = await response.json();

      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const distanceInMeters = data.rows[0].elements[0].distance.value;
        const distanceInKm = (distanceInMeters / 1000).toFixed(1);
        
        setLoading(false);
        return {
          distance: parseFloat(distanceInKm),
          distanceText: data.rows[0].elements[0].distance.text,
          duration: data.rows[0].elements[0].duration.text,
        };
      } else {
        throw new Error('Unable to calculate distance. Please check the address.');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      
      // Fallback: estimate based on pincode or return mock data
      console.warn('Distance API failed, using fallback calculation');
      return {
        distance: 15,
        distanceText: '15 km (estimated)',
        duration: '30 mins (estimated)',
        isFallback: true
      };
    }
  }, []);

  return { calculateDistance, loading, error };
};
