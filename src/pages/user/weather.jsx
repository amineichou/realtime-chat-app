import React, { useEffect, useState } from "react";
import descriptionData from "./description.json"; // Make sure this file is correctly imported
import "./styles/weather.css";

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [location, setLocation] = useState("Unknown Location");
  const [error, setError] = useState("");

  // Function to determine the greeting based on current time
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good Morning!";
    } else if (currentHour < 18) {
      return "Good Afternoon!";
    } else {
      return "Good Evening!";
    }
  };

  // Fetch weather data using Open Meteo API
  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();
      const { temperature, weathercode } = data.current_weather;

      // Determine if it's day or night based on the current time
      const isDaytime = new Date().getHours() >= 6 && new Date().getHours() <= 18;
      const timeOfDay = isDaytime ? "day" : "night";

      // Get the description and image from the description.json
      const weatherInfo = descriptionData[weathercode]?.[timeOfDay] || {
        description: "Unknown weather",
        image: ""
      };

      setWeather({
        temperature,
        description: weatherInfo.description,
        image: weatherInfo.image,
      });

      // Fetch location name using Nominatim reverse geocoding
      fetchLocationName(latitude, longitude);
    } catch (error) {
      setError(error.message);
      // Fallback to default location if fetching fails
      fallbackWeather();
    }
  };

  // Get the user's location and fetch weather
  const getLocationAndFetchWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (error) => {
          setError("Unable to retrieve location. " + error.message);
          // Fallback to default location if unable to retrieve
          fallbackWeather();
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      // Fallback to default location if geolocation is not supported
      fallbackWeather();
    }
  };

  // Fallback weather data for a default location (e.g., New York)
  const fallbackWeather = async () => {
    const defaultLatitude = 40.7128; // New York City Latitude
    const defaultLongitude = -74.0060; // New York City Longitude
    await fetchWeather(defaultLatitude, defaultLongitude);
    setLocation("New York City");
  };

  // Fetch location name using reverse geocoding (OpenStreetMap Nominatim)
  const fetchLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data = await response.json();
      const locationName = data.address.city || data.address.town || data.address.village || "Unknown Location";
      setLocation(locationName);
    } catch (error) {
      setError("Failed to fetch location name.");
      setLocation("Unknown Location");
    }
  };

  useEffect(() => {
    setGreeting(getGreeting());
    getLocationAndFetchWeather();
  }, []);

  return (
    <div className="weather-component">
      {error && <p className="error-message">{error}</p>}
      <h2>{greeting}</h2>
      {weather ? (
          <div className="weather-info">
          {/* <h3>{location}</h3> */}
          <img src={weather.image} alt={weather.description} />
          <h3>{weather.temperature}°C</h3>
          <p>{weather.description}</p>
        </div>
      ) : (
        <p>Loading weather...</p>
      )}
    </div>
  );
};

export default Weather;
