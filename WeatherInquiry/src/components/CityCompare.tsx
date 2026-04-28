import { useState, useCallback } from 'react'
import { getCurrentWeather, type CurrentWeather } from '../api/weather'

interface CityCompareProps {
  onCityClick: (city: string) => void
}

interface CompareCity {
  name: string
  weather: CurrentWeather
}

const PRESET_CITIES = ['Beijing', 'Shanghai', 'Guangzhou', 'Tokyo', 'New York', 'London']

export default function CityCompare({ onCityClick }: CityCompareProps) {
  const [cities, setCities] = useState<CompareCity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')

  const addCity = useCallback(async (cityName: string) => {
    const trimmed = cityName.trim()
    if (!trimmed) return
    if (cities.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return
    if (cities.length >= 6) {
      setError('最多对比 6 个城市')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const weather = await getCurrentWeather(trimmed)
      setCities((prev) => [...prev, { name: weather.name, weather }])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取城市天气失败')
    } finally {
      setLoading(false)
    }
  }, [cities])

  const removeCity = useCallback((name: string) => {
    setCities((prev) => prev.filter((c) => c.name !== name))
  }, [])

  const handleAdd = () => {
    addCity(input)
    setInput('')
  }

  return (
    <div className="city-compare">
      <h3 className="compare-title">🏙 多城市对比</h3>
      <div className="compare-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入城市名添加对比"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
        />
        <button onClick={handleAdd} disabled={loading || !input.trim()}>添加</button>
      </div>

      <div className="compare-presets">
        {PRESET_CITIES.map((city) => (
          <button
            key={city}
            className="preset-btn"
            onClick={() => addCity(city)}
            disabled={loading || cities.some((c) => c.name.toLowerCase() === city.toLowerCase())}
          >
            + {city}
          </button>
        ))}
      </div>

      {error && <p className="compare-error">{error}</p>}

      {cities.length > 0 && (
        <div className="compare-table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th>城市</th>
                <th>温度</th>
                <th>体感</th>
                <th>天气</th>
                <th>湿度</th>
                <th>风速</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => {
                const condition = city.weather.weather[0]
                return (
                  <tr key={city.name}>
                    <td>
                      <button className="compare-city-link" onClick={() => onCityClick(city.name)}>
                        {city.name}
                      </button>
                    </td>
                    <td>{Math.round(city.weather.main.temp)}℃</td>
                    <td>{Math.round(city.weather.main.feels_like)}℃</td>
                    <td>{condition?.description ?? '-'}</td>
                    <td>{city.weather.main.humidity}%</td>
                    <td>{city.weather.wind.speed} m/s</td>
                    <td>
                      <button className="compare-remove" onClick={() => removeCity(city.name)}>×</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
