// To use Google Weather API, you'll need to enable the Places API and Geocoding API in your Google Cloud Console
// and create an API key with the appropriate permissions.

import { WeatherData } from '@/store/appStore';

export const getWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  // Note: You'll need to replace this placeholder URL with the actual Google Weather API endpoint
  // when it becomes publicly available. For now, you can use Google Places API to get location
  // and another weather provider as a fallback.
  
  try {
    // 1. First, get the location name using Google's Geocoding API
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.VITE_GOOGLE_API_KEY}`
    );
    const geocodeData = await geocodeResponse.json();
    const locationName = geocodeData.results[0]?.formatted_address || 'Unknown Location';

    // 2. For now, use OpenWeatherMap as a fallback until Google Weather API is available
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.VITE_OPENWEATHER_API_KEY}&units=metric`
    );
    const weatherData = await weatherResponse.json();

    return {
      condition: weatherData.weather[0].main,
      temperature: weatherData.main.temp,
      description: weatherData.weather[0].description,
      location: {
        lat,
        lon,
        name: locationName,
      },
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  });
};