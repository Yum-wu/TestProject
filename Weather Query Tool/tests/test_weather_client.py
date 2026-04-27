import pytest
from unittest.mock import Mock, patch
from src.core.weather_client import WeatherClient
from src.core.openweather_client import OpenWeatherClient
from src.core.weather_data import WeatherData


class TestOpenWeatherClient:
    """
    测试OpenWeather客户端
    """
    
    def setup_method(self):
        """
        测试前的设置
        """
        self.api_key = "test_api_key"
        self.client = OpenWeatherClient(self.api_key)
    
    @patch('src.utils.http_client.HTTPClient.get')
    def test_get_current_weather(self, mock_get):
        """
        测试获取当前天气
        """
        # 模拟响应
        mock_response = Mock()
        mock_response.json.return_value = {
            'name': 'Beijing',
            'main': {
                'temp': 25,
                'humidity': 60
            },
            'weather': [{
                'description': 'clear sky'
            }],
            'wind': {
                'speed': 5
            }
        }
        mock_get.return_value = mock_response
        
        # 调用方法
        weather = self.client.get_current_weather('Beijing')
        
        # 验证结果
        assert isinstance(weather, WeatherData)
        assert weather.city == 'Beijing'
        assert weather.temperature == 25
        assert weather.description == 'clear sky'
        assert weather.humidity == 60
        assert weather.wind_speed == 5
    
    @patch('src.utils.http_client.HTTPClient.get')
    def test_get_forecast(self, mock_get):
        """
        测试获取天气预报
        """
        # 模拟响应
        mock_response = Mock()
        mock_response.json.return_value = {
            'city': {
                'name': 'Shanghai'
            },
            'list': [
                {
                    'dt': 1620000000,
                    'main': {
                        'temp': 20,
                        'humidity': 50
                    },
                    'weather': [{
                        'description': 'partly cloudy'
                    }],
                    'wind': {
                        'speed': 3
                    }
                },
                {
                    'dt': 1620086400,  # 24 hours later
                    'main': {
                        'temp': 22,
                        'humidity': 55
                    },
                    'weather': [{
                        'description': 'sunny'
                    }],
                    'wind': {
                        'speed': 4
                    }
                }
            ]
        }
        mock_get.return_value = mock_response
        
        # 调用方法
        forecast = self.client.get_forecast('Shanghai', days=2)
        
        # 验证结果
        assert len(forecast) == 2
        assert isinstance(forecast[0], WeatherData)
        assert forecast[0].city == 'Shanghai'
        assert forecast[1].city == 'Shanghai'