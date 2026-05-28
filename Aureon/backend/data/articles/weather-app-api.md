---
title: "天气查询应用的 API 集成与定位开发实战"
date: 2026-05-08
slug: weather-app-api-integration
tags: [React, API, 地理定位, TypeScript]
category: 技术
excerpt: 从我的天气查询项目总结第三方 API 集成、地理定位和多城市对比功能的实现经验。
lang: zh
---

## 项目概览

我的 [WeatherInquiry](https://github.com/Yum-wu/TestProject) 项目是一个天气查询应用，支持：
- 按城市名搜索天气
- 浏览器自动定位
- 7 天天气预报
- 空气质量指数 (AQI)
- 多城市对比

## 三层 API 调用设计

天气查询同时涉及三个 API 的并发调用：

```typescript
const fetchWeather = async (location: LocationQuery) => {
  setLoading(true);
  try {
    // 并发请求天气和预报数据
    const [weatherData, forecastData] = await Promise.all([
      getCurrentWeather(location),
      getForecast(location),
    ]);
    setCurrentWeather(weatherData);
    setForecast(forecastData);

    // 可选：空气质量数据（可能失败，不影响主流程）
    try {
      const aqiData = await getAqi(
        weatherData.coord.lat,
        weatherData.coord.lon
      );
      setAqi(aqiData);
    } catch {
      setAqi(null); // 空气质量获取失败不影响使用
    }
  } catch (err) {
    setError("查询失败，请稍后重试");
  } finally {
    setLoading(false);
  }
};
```

这里的关键设计是：**空气质量数据是可选增强功能**，即使获取失败也不影响核心的天气展示。

## 浏览器地理定位

利用浏览器 Geolocation API 实现自动定位：

```typescript
const handleLocate = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeather({ lat: latitude, lon: longitude });
    },
    (error) => {
      setError("无法获取位置，请手动搜索");
    }
  );
};
```

## 多城市对比

用户可以将多个城市的天气信息放在一起对比，这个功能需要对每个城市分别请求，然后汇总展示。

## 项目架构

```
WeatherInquiry/
├── api/               # API 请求层
│   └── weather.ts     # 天气 API 封装
├── components/
│   ├── WeatherCard.tsx  # 天气卡片
│   ├── SearchBar.tsx    # 搜索栏
│   ├── Favorites.tsx    # 收藏城市
│   └── CityCompare.tsx  # 多城市对比
└── App.tsx
```

## 总结

这个项目虽然不大，但涉及了多个典型的 Web 开发场景：第三方 API 集成、并发请求管理、浏览器 API 调用、错误边界处理等，是一个很好的练手项目。
