const REMOTE_URL = "https://api.openweathermap.org/data/2.5";
const PROXY_PREFIX = "/api/openweather/data/2.5";
const REQUEST_TIMEOUT = 25000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000;

function getBaseUrl(): string {
  if (import.meta.env.DEV) {
    return PROXY_PREFIX;
  }
  return REMOTE_URL;
}

function getApiKey(): string {
  const key = import.meta.env.VITE_WEATHER_API_KEY;
  if (!key) {
    throw new Error(
      "未配置 API Key，请在 .env 文件中设置 VITE_WEATHER_API_KEY",
    );
  }
  return key;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  coord: { lon: number; lat: number };
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  dt: number;
  sys: { country: string; sunrise: number; sunset: number };
  timezone: number;
  name: string;
  cod: number;
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: WeatherCondition[];
  clouds: { all: number };
  wind: { speed: number; deg: number; gust?: number };
  visibility: number;
  pop: number;
  dt_txt: string;
}

export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface AqiData {
  coord: { lon: number; lat: number };
  list: Array<{
    main: { aqi: number };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }>;
}

export type LocationQuery = string | { lat: number; lon: number };

function buildParams(location: LocationQuery): URLSearchParams {
  const params = new URLSearchParams({
    units: "metric",
    lang: "zh_cn",
  });
  if (typeof location === "string") {
    params.set("q", location);
  } else {
    params.set("lat", String(location.lat));
    params.set("lon", String(location.lon));
  }
  if (!import.meta.env.DEV) {
    params.set("appid", getApiKey());
  }
  return params;
}

function buildUrl(endpoint: string, location: LocationQuery): string {
  const params = buildParams(location);
  return `${getBaseUrl()}${endpoint}?${params.toString()}`;
}

function buildCoordsUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  if (!import.meta.env.DEV) {
    params.set("appid", getApiKey());
  }
  return `${getBaseUrl()}/air_pollution?${params.toString()}`;
}

function isApiError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.startsWith("API Key") ||
      error.message.startsWith("城市未找到") ||
      error.message.startsWith("请求过于频繁") ||
      error.message.startsWith("网络请求失败"))
  );
}

async function fetchWithRetry(
  url: string,
  timeout: number = REQUEST_TIMEOUT,
  retries: number = MAX_RETRIES,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof Error && error.name === "AbortError") {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        throw new Error(
          "请求超时，服务器响应过慢。请检查网络连接后重试，或稍后再试",
          { cause: error },
        );
      }
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        continue;
      }
      throw new Error("网络请求失败，请检查网络连接", { cause: error });
    }
  }
  throw new Error("请求失败");
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = "未知错误";
    try {
      const errorData = await response.json();
      errorMsg = errorData.message ?? errorMsg;
    } catch {
      // ignore json parse error
    }
    const status = response.status;
    if (status === 401) {
      throw new Error(`API Key 无效，请检查配置 (${errorMsg})`);
    } else if (status === 404) {
      throw new Error("城市未找到，请检查名称（可尝试英文或拼音）");
    } else if (status === 429) {
      throw new Error("请求过于频繁，请稍后重试");
    } else {
      throw new Error(`网络请求失败（${status}）：${errorMsg}`);
    }
  }
  const data: T = await response.json();
  return data;
}

async function requestByUrl<T>(url: string): Promise<T> {
  try {
    const response = await fetchWithRetry(url);
    return await handleResponse<T>(response);
  } catch (error) {
    if (isApiError(error)) throw error;
    if (error instanceof Error && error.message.includes("请求超时")) {
      throw error;
    }
    throw new Error("网络请求失败，请检查网络连接", { cause: error });
  }
}

async function request<T>(
  endpoint: string,
  location: LocationQuery,
): Promise<T> {
  const url = buildUrl(endpoint, location);
  return requestByUrl<T>(url);
}

export async function getCurrentWeather(
  location: LocationQuery,
): Promise<CurrentWeather> {
  return request<CurrentWeather>("/weather", location);
}

export async function getForecast(
  location: LocationQuery,
): Promise<ForecastResponse> {
  return request<ForecastResponse>("/forecast", location);
}

export async function getAqi(lat: number, lon: number): Promise<AqiData> {
  const url = buildCoordsUrl(lat, lon);
  return requestByUrl<AqiData>(url);
}

export function getAqiLevel(aqi: number): {
  label: string;
  color: string;
  desc: string;
} {
  if (aqi === 1)
    return {
      label: "优",
      color: "#27ae60",
      desc: "空气质量令人满意，基本无污染",
    };
  if (aqi === 2)
    return {
      label: "良",
      color: "#f1c40f",
      desc: "空气质量可接受，部分污染物对极少数敏感人群有轻微影响",
    };
  if (aqi === 3)
    return {
      label: "轻度",
      color: "#e67e22",
      desc: "敏感人群可能出现健康影响",
    };
  if (aqi === 4)
    return {
      label: "中度",
      color: "#e74c3c",
      desc: "所有人可能开始出现健康影响",
    };
  return {
    label: "重度",
    color: "#8e44ad",
    desc: "健康警报，所有人可能受到更严重的健康影响",
  };
}

export function detectWeatherAlerts(
  weather: CurrentWeather,
): Array<{ type: string; level: string; message: string }> {
  const alerts: Array<{ type: string; level: string; message: string }> = [];
  const temp = weather.main.temp;
  const windSpeed = weather.wind.speed;
  const humidity = weather.main.humidity;
  const visibility = weather.visibility;

  if (temp >= 35) {
    alerts.push({
      type: "高温",
      level: temp >= 40 ? "红色" : "橙色",
      message: `当前温度 ${Math.round(temp)}℃，请注意防暑降温，避免长时间户外活动`,
    });
  } else if (temp <= -10) {
    alerts.push({
      type: "严寒",
      level: temp <= -20 ? "红色" : "橙色",
      message: `当前温度 ${Math.round(temp)}℃，请注意保暖防冻，减少外出`,
    });
  } else if (temp <= 0) {
    alerts.push({
      type: "低温",
      level: "蓝色",
      message: `当前温度 ${Math.round(temp)}℃，注意防寒保暖`,
    });
  }

  if (windSpeed >= 17) {
    alerts.push({
      type: "大风",
      level: windSpeed >= 25 ? "红色" : "橙色",
      message: `风速 ${windSpeed.toFixed(1)} m/s，大风天气请注意安全`,
    });
  } else if (windSpeed >= 10) {
    alerts.push({
      type: "大风",
      level: "蓝色",
      message: `风速 ${windSpeed.toFixed(1)} m/s，注意防风`,
    });
  }

  if (humidity >= 90 && temp >= 25) {
    alerts.push({
      type: "闷热",
      level: "黄色",
      message: `湿度 ${humidity}%，高温高湿天气，注意防暑`,
    });
  }

  if (visibility < 1000) {
    alerts.push({
      type: "大雾",
      level: visibility < 200 ? "红色" : "橙色",
      message: `能见度仅 ${visibility}m，出行请注意安全`,
    });
  } else if (visibility < 5000) {
    alerts.push({
      type: "雾霾",
      level: "黄色",
      message: `能见度 ${visibility}m，轻度雾霾，敏感人群减少外出`,
    });
  }

  const conditionId = weather.weather[0]?.id ?? 0;
  if (conditionId >= 200 && conditionId < 300) {
    alerts.push({
      type: "雷暴",
      level: "橙色",
      message: "当前有雷暴天气，请远离空旷地带和高大建筑物",
    });
  }
  if (conditionId >= 500 && conditionId < 600) {
    if (conditionId >= 502) {
      alerts.push({
        type: "暴雨",
        level: conditionId >= 504 ? "红色" : "橙色",
        message: "降雨量较大，注意防范洪涝",
      });
    }
  }
  if (conditionId >= 600 && conditionId < 700) {
    if (conditionId >= 602) {
      alerts.push({
        type: "大雪",
        level: "橙色",
        message: "降雪量较大，注意出行安全",
      });
    }
  }

  return alerts;
}
