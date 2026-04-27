from .weather_client import WeatherClient
from .openweather_client import OpenWeatherClient
from .weather_data import WeatherData
import logging


class WeatherService:
    """
    天气服务核心类
    协调各组件工作，提供统一的天气查询接口
    """
    
    def __init__(self, client=None, api_key=None):
        """
        初始化天气服务
        
        Args:
            client (WeatherClient, optional): 天气API客户端
            api_key (str, optional): API密钥（当client为None时使用）
        """
        if client:
            self.client = client
        elif api_key:
            self.client = OpenWeatherClient(api_key)
        else:
            raise ValueError("Either client or api_key must be provided")
        
        self.logger = logging.getLogger(__name__)
    
    def get_current_weather(self, city):
        """
        获取当前天气
        
        Args:
            city (str): 城市名称
            
        Returns:
            WeatherData: 天气数据对象
        """
        try:
            self.logger.info(f"Getting current weather for {city}")
            weather = self.client.get_current_weather(city)
            self.logger.info(f"Successfully got weather for {city}: {weather.description}")
            return weather
        except Exception as e:
            self.logger.error(f"Error getting current weather: {str(e)}")
            raise
    
    def get_forecast(self, city, days=5):
        """
        获取天气预报
        
        Args:
            city (str): 城市名称
            days (int): 预报天数
            
        Returns:
            list[WeatherData]: 天气预报数据列表
        """
        try:
            self.logger.info(f"Getting {days}-day forecast for {city}")
            forecast = self.client.get_forecast(city, days)
            self.logger.info(f"Successfully got forecast for {city}")
            return forecast
        except Exception as e:
            self.logger.error(f"Error getting forecast: {str(e)}")
            raise
    
    def get_weather_trend(self, city, days=7):
        """
        获取天气趋势
        
        Args:
            city (str): 城市名称
            days (int): 趋势分析天数
            
        Returns:
            dict: 天气趋势数据
        """
        try:
            self.logger.info(f"Getting weather trend for {city}")
            forecast = self.client.get_forecast(city, days)
            
            # 分析趋势
            trend = {
                'city': city,
                'days': days,
                'temperatures': [day.temperature for day in forecast],
                'descriptions': [day.description for day in forecast],
                'dates': [day.date for day in forecast],
                'avg_temperature': sum(day.temperature for day in forecast) / len(forecast),
                'max_temperature': max(day.temperature for day in forecast),
                'min_temperature': min(day.temperature for day in forecast)
            }
            
            self.logger.info(f"Successfully got weather trend for {city}")
            return trend
        except Exception as e:
            self.logger.error(f"Error getting weather trend: {str(e)}")
            raise