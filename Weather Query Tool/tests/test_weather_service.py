import pytest
from unittest.mock import Mock, patch
from src.core.weather_service import WeatherService
from src.core.weather_data import WeatherData
from datetime import datetime


class TestWeatherService:
    """
    测试天气服务
    """
    
    def setup_method(self):
        """
        测试前的设置
        """
        # 创建模拟客户端
        self.mock_client = Mock()
        self.service = WeatherService(client=self.mock_client)
    
    def test_get_current_weather(self):
        """
        测试获取当前天气
        """
        # 模拟客户端返回值
        mock_weather = WeatherData(
            city='Beijing',
            temperature=25,
            description='clear sky',
            humidity=60,
            wind_speed=5,
            date=datetime.now()
        )
        self.mock_client.get_current_weather.return_value = mock_weather
        
        # 调用方法
        weather = self.service.get_current_weather('Beijing')
        
        # 验证结果
        assert weather == mock_weather
        self.mock_client.get_current_weather.assert_called_once_with('Beijing')
    
    def test_get_forecast(self):
        """
        测试获取天气预报
        """
        # 模拟客户端返回值
        mock_forecast = [
            WeatherData(
                city='Shanghai',
                temperature=20,
                description='partly cloudy',
                humidity=50,
                wind_speed=3,
                date=datetime.now()
            ),
            WeatherData(
                city='Shanghai',
                temperature=22,
                description='sunny',
                humidity=55,
                wind_speed=4,
                date=datetime.now()
            )
        ]
        self.mock_client.get_forecast.return_value = mock_forecast
        
        # 调用方法
        forecast = self.service.get_forecast('Shanghai', days=2)
        
        # 验证结果
        assert forecast == mock_forecast
        self.mock_client.get_forecast.assert_called_once_with('Shanghai', 2)
    
    def test_get_weather_trend(self):
        """
        测试获取天气趋势
        """
        # 模拟客户端返回值
        mock_forecast = [
            WeatherData(
                city='Guangzhou',
                temperature=28,
                description='sunny',
                humidity=70,
                wind_speed=2,
                date=datetime.now()
            ),
            WeatherData(
                city='Guangzhou',
                temperature=29,
                description='sunny',
                humidity=65,
                wind_speed=3,
                date=datetime.now()
            ),
            WeatherData(
                city='Guangzhou',
                temperature=27,
                description='cloudy',
                humidity=75,
                wind_speed=1,
                date=datetime.now()
            )
        ]
        self.mock_client.get_forecast.return_value = mock_forecast
        
        # 调用方法
        trend = self.service.get_weather_trend('Guangzhou', days=3)
        
        # 验证结果
        assert trend['city'] == 'Guangzhou'
        assert trend['days'] == 3
        assert len(trend['temperatures']) == 3
        assert len(trend['descriptions']) == 3
        assert len(trend['dates']) == 3
        assert trend['avg_temperature'] == (28 + 29 + 27) / 3
        assert trend['max_temperature'] == 29
        assert trend['min_temperature'] == 27
        self.mock_client.get_forecast.assert_called_once_with('Guangzhou', 3)