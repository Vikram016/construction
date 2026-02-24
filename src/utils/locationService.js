// Get user's current location using GPS
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

// Convert coordinates to address using Google Geocoding API
export const getAddressFromCoordinates = async (latitude, longitude) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error('No address found for the given coordinates');
    }

    const result = data.results[0];
    const addressComponents = result.address_components;

    // Extract address components
    const getComponent = (types) => {
      const component = addressComponents.find(c => 
        types.some(type => c.types.includes(type))
      );
      return component ? component.long_name : '';
    };

    return {
      fullAddress: result.formatted_address,
      street: getComponent(['route']),
      locality: getComponent(['locality', 'sublocality']),
      city: getComponent(['locality', 'administrative_area_level_2']),
      state: getComponent(['administrative_area_level_1']),
      pincode: getComponent(['postal_code']),
      country: getComponent(['country'])
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

// Get address from pincode using Google Geocoding API
export const getAddressFromPincode = async (pincode) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode},India&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error('Invalid pincode or address not found');
    }

    const result = data.results[0];
    const addressComponents = result.address_components;
    const location = result.geometry.location;

    const getComponent = (types) => {
      const component = addressComponents.find(c => 
        types.some(type => c.types.includes(type))
      );
      return component ? component.long_name : '';
    };

    return {
      latitude: location.lat,
      longitude: location.lng,
      fullAddress: result.formatted_address,
      city: getComponent(['locality', 'administrative_area_level_2']),
      state: getComponent(['administrative_area_level_1']),
      pincode: getComponent(['postal_code'])
    };
  } catch (error) {
    console.error('Pincode lookup error:', error);
    throw error;
  }
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Mock warehouse location (replace with actual from Firestore/config)
export const WAREHOUSE_LOCATION = {
  latitude: 19.0760, // Mumbai coordinates
  longitude: 72.8777,
  name: 'BuildMart Warehouse'
};
