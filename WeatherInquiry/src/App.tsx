import { useState, useEffect, useCallback } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import WeatherAlert from "./components/WeatherAlert";
import Favorites from "./components/Favorites";
import CityCompare from "./components/CityCompare";
import Spinner from "./components/Spinner";
import { getCurrentWeather, getForecast, getAqi } from "./api/weather";
import type {
  CurrentWeather,
  ForecastResponse,
  AqiData,
  LocationQuery,
} from "./api/weather";
import "./App.css";

function App() {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(
    null,
  );
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [aqi, setAqi] = useState<AqiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const fetchWeather = useCallback(async (location: LocationQuery) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(location),
        getForecast(location),
      ]);
      setCurrentWeather(weatherData);
      setForecast(forecastData);

      try {
        const aqiData = await getAqi(
          weatherData.coord.lat,
          weatherData.coord.lon,
        );
        setAqi(aqiData);
      } catch {
        setAqi(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "查询失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      fetchWeather(query);
    },
    [fetchWeather],
  );

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("您的浏览器不支持定位功能");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather({ lat: latitude, lon: longitude }).finally(() =>
          setLocating(false),
        );
      },
      () => {
        setError("无法获取位置，请允许定位权限或手动搜索");
        setLocating(false);
      },
    );
  }, [fetchWeather]);

  const currentCity = currentWeather?.name ?? null;

  return (
    <div className="app">
      <h1 className="app-title">🌤 天气查询</h1>
      <SearchBar onSearch={handleSearch} loading={loading} />
      <div className="action-row">
        <button
          className="locate-btn"
          onClick={handleLocate}
          disabled={locating || loading}
        >
          {locating ? "定位中…" : "📍 自动定位"}
        </button>
        <button
          className="compare-btn"
          onClick={() => setShowCompare((v) => !v)}
        >
          {showCompare ? "收起对比" : "🏙 多城市对比"}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {loading && <Spinner text="查询中…" />}

      {showCompare && <CityCompare onCityClick={handleSearch} />}

      {currentWeather && !loading ? (
        <>
          <WeatherAlert weather={currentWeather} />
          <WeatherCard
            weather={currentWeather}
            forecast={forecast ?? undefined}
            aqi={aqi ?? undefined}
          />
          <Favorites currentCity={currentCity} onSelect={handleSearch} />
        </>
      ) : (
        !loading &&
        !showCompare && (
          <div className="empty-hint">
            <p>请输入城市名称或点击自动定位查询天气</p>
            <p className="empty-sub">
              支持英文城市名，如 Beijing、Tokyo、London
            </p>
          </div>
        )
      )}
    </div>
  );
}

export default App;
