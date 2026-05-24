---
title: "Weather App API Integration & Geolocation Development"
date: 2026-05-08
slug: weather-app-api-integration
tags: [React, API, Geolocation, TypeScript]
category: Technology
excerpt: Lessons learned from building a weather inquiry project — third-party API integration, geolocation, and multi-city comparison features.
lang: en
---

## Project Overview

My [WeatherInquiry](https://github.com/Yum-wu/TestProject) project is a weather query app supporting:
- City name search
- Browser auto-location
- 7-day weather forecast
- Air Quality Index (AQI)
- Multi-city comparison

## Three-Layer API Call Design

Weather queries involve concurrent calls to three APIs:

```typescript
const fetchWeather = async (location: LocationQuery) => {
  setLoading(true);
  try {
    const [weatherData, forecastData] = await Promise.all([
      getCurrentWeather(location),
      getForecast(location),
    ]);
    setCurrentWeather(weatherData);
    setForecast(forecastData);

    // Optional: AQI data (may fail, doesn't affect main flow)
    try {
      const aqiData = await getAqi(
        weatherData.coord.lat,
        weatherData.coord.lon
      );
      setAqi(aqiData);
    } catch {
      setAqi(null);
    }
  } catch (err) {
    setError("Query failed, please try again");
  } finally {
    setLoading(false);
  }
};
```

Key design: **AQI data is an optional enhancement** — failure doesn't affect core weather display.

## Browser Geolocation

Using the Geolocation API for auto-location:

```typescript
const handleLocate = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeather({ lat: latitude, lon: longitude });
    },
    (error) => {
      setError("Unable to get location, please search manually");
    }
  );
};
```

## Multi-City Comparison

Users can compare weather data across multiple cities, requiring separate API requests for each city.

## Summary

Although this project is small, it covers several typical web development scenarios: third-party API integration, concurrent request management, browser API usage, and error boundary handling — making it a great practice project.
