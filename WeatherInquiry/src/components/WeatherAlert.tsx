import { useMemo } from 'react'
import { detectWeatherAlerts, type CurrentWeather } from '../api/weather'

interface WeatherAlertProps {
  weather: CurrentWeather
}

function getLevelColor(level: string): string {
  switch (level) {
    case '红色': return '#e74c3c'
    case '橙色': return '#e67e22'
    case '黄色': return '#f1c40f'
    case '蓝色': return '#3498db'
    default: return '#95a5a6'
  }
}

export default function WeatherAlert({ weather }: WeatherAlertProps) {
  const alerts = useMemo(() => detectWeatherAlerts(weather), [weather])

  if (alerts.length === 0) return null

  return (
    <div className="weather-alerts">
      <h3 className="alerts-title">⚠️ 天气预警</h3>
      {alerts.map((alert, index) => (
        <div
          key={`${alert.type}-${index}`}
          className="alert-item"
          style={{ borderLeftColor: getLevelColor(alert.level) }}
        >
          <span className="alert-badge" style={{ background: getLevelColor(alert.level) }}>
            {alert.type} {alert.level}
          </span>
          <p className="alert-message">{alert.message}</p>
        </div>
      ))}
    </div>
  )
}
