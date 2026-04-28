import { useMemo, type FC } from "react";
import type {
  CurrentWeather,
  ForecastResponse,
  ForecastItem,
  AqiData,
} from "../api/weather";
import { getAqiLevel } from "../api/weather";

interface WeatherCardProps {
  weather: CurrentWeather;
  forecast?: ForecastResponse;
  aqi?: AqiData;
}

interface DailyForecast {
  date: string;
  weekday: string;
  tempMin: number;
  tempMax: number;
  icon: string;
  description: string;
}

function getIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

function getWeatherAnimation(conditionId: number): string {
  if (conditionId >= 200 && conditionId < 300) return "animate-thunder";
  if (conditionId >= 300 && conditionId < 400) return "animate-drizzle";
  if (conditionId >= 500 && conditionId < 600) return "animate-rain";
  if (conditionId >= 600 && conditionId < 700) return "animate-snow";
  if (conditionId >= 700 && conditionId < 800) return "animate-fog";
  if (conditionId === 800) return "animate-clear";
  return "animate-cloud";
}

function groupForecastByDay(list: ForecastItem[]): Map<string, ForecastItem[]> {
  const map = new Map<string, ForecastItem[]>();
  for (const item of list) {
    const date = item.dt_txt.split(" ")[0];
    const existing = map.get(date);
    if (existing) {
      existing.push(item);
    } else {
      map.set(date, [item]);
    }
  }
  return map;
}

function formatWeekday(dateStr: string): string {
  const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const d = new Date(dateStr + "T00:00:00");
  return days[d.getDay()];
}

function buildDailyForecast(list: ForecastItem[]): DailyForecast[] {
  const grouped = groupForecastByDay(list);
  const today = new Date().toISOString().split("T")[0];
  const result: DailyForecast[] = [];

  grouped.forEach((items, date) => {
    if (date === today) return;
    const tempMin = Math.min(...items.map((i) => i.main.temp_min));
    const tempMax = Math.max(...items.map((i) => i.main.temp_max));
    const midItem = items[Math.floor(items.length / 2)];
    result.push({
      date,
      weekday: formatWeekday(date),
      tempMin: Math.round(tempMin),
      tempMax: Math.round(tempMax),
      icon: midItem.weather[0].icon,
      description: midItem.weather[0].description,
    });
  });

  return result.slice(0, 5);
}

const WeatherCard: FC<WeatherCardProps> = ({ weather, forecast, aqi }) => {
  const { name, sys, main, weather: conditions, wind, visibility } = weather;
  const condition = conditions[0];

  const dailyForecast = useMemo(
    () => (forecast ? buildDailyForecast(forecast.list) : []),
    [forecast],
  );

  const aqiInfo = useMemo(() => {
    if (!aqi || aqi.list.length === 0) return null;
    const aqiValue = aqi.list[0].main.aqi;
    const level = getAqiLevel(aqiValue);
    const components = aqi.list[0].components;
    return { aqiValue, ...level, components };
  }, [aqi]);

  const animationClass = condition ? getWeatherAnimation(condition.id) : "";

  return (
    <div className="weather-card">
      <div className="weather-current">
        <div className="weather-header">
          <h2>
            {name}, {sys.country}
          </h2>
          <div className={`weather-icon-animated ${animationClass}`}>
            <img
              src={getIconUrl(condition.icon)}
              alt={condition.description}
              className="weather-icon"
            />
          </div>
        </div>
        <div className="weather-temp">{Math.round(main.temp)}℃</div>
        <p className="weather-desc">{condition.description}</p>
        <div className="weather-details">
          <span>体感 {Math.round(main.feels_like)}℃</span>
          <span>湿度 {main.humidity}%</span>
          <span>风速 {wind.speed} m/s</span>
          <span>
            能见度{" "}
            {visibility >= 1000
              ? `${(visibility / 1000).toFixed(1)}km`
              : `${visibility}m`}
          </span>
        </div>
      </div>

      {aqiInfo && (
        <div className="weather-aqi">
          <h3>空气质量</h3>
          <div className="aqi-display">
            <span className="aqi-badge" style={{ background: aqiInfo.color }}>
              AQI {aqiInfo.aqiValue} · {aqiInfo.label}
            </span>
            <p className="aqi-desc">{aqiInfo.desc}</p>
          </div>
          <div className="aqi-details">
            <span>PM2.5: {aqiInfo.components.pm2_5.toFixed(1)}</span>
            <span>PM10: {aqiInfo.components.pm10.toFixed(1)}</span>
            <span>O₃: {aqiInfo.components.o3.toFixed(1)}</span>
            <span>NO₂: {aqiInfo.components.no2.toFixed(1)}</span>
          </div>
        </div>
      )}

      {dailyForecast.length > 0 && (
        <div className="weather-forecast">
          <h3>未来天气预报</h3>
          <div className="forecast-list">
            {dailyForecast.map((day) => (
              <div key={day.date} className="forecast-item">
                <span className="forecast-day">{day.weekday}</span>
                <img
                  src={getIconUrl(day.icon)}
                  alt={day.description}
                  className="forecast-icon"
                />
                <span className="forecast-desc">{day.description}</span>
                <span className="forecast-temp">
                  {day.tempMax}° / {day.tempMin}°
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
