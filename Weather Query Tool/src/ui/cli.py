import argparse
from datetime import datetime
from ..core.weather_service import WeatherService
from ..utils.config import ConfigManager
from ..utils.logger import Logger


class CLI:
    """
    命令行界面类
    """
    
    def __init__(self):
        """
        初始化命令行界面
        """
        self.config = ConfigManager()
        self.logger = Logger.get_logger(__name__)
        self.weather_service = WeatherService(api_key=self.config.get_api_key('openweather'))
    
    def parse_args(self):
        """
        解析命令行参数
        
        Returns:
            argparse.Namespace: 命令行参数
        """
        parser = argparse.ArgumentParser(description='Weather Query Tool')
        parser.add_argument('--city', type=str, help='City name')
        parser.add_argument('--forecast', action='store_true', help='Get weather forecast')
        parser.add_argument('--trend', action='store_true', help='Get weather trend')
        parser.add_argument('--gui', action='store_true', help='Open GUI')
        parser.add_argument('--days', type=int, default=5, help='Number of forecast days')
        return parser.parse_args()
    
    def run(self):
        """
        运行命令行界面
        """
        args = self.parse_args()
        
        if args.gui:
            # 打开图形化界面
            from .gui import GUI
            gui = GUI()
            gui.run()
            return
        
        # 非GUI模式需要city参数
        if not args.city:
            print("Error: --city is required for non-GUI mode")
            return
        
        try:
            if args.trend:
                # 获取天气趋势
                trend = self.weather_service.get_weather_trend(args.city, args.days)
                self._display_trend(trend)
            elif args.forecast:
                # 获取天气预报
                forecast = self.weather_service.get_forecast(args.city, args.days)
                self._display_forecast(forecast)
            else:
                # 获取当前天气
                weather = self.weather_service.get_current_weather(args.city)
                self._display_current_weather(weather)
        except Exception as e:
            self.logger.error(f"Error: {str(e)}")
            print(f"Error: {str(e)}")
    
    def _display_current_weather(self, weather):
        """
        显示当前天气
        
        Args:
            weather (WeatherData): 天气数据
        """
        print(f"\n=== Current Weather in {weather.city} ===")
        print(f"Temperature: {weather.temperature}°C")
        print(f"Description: {weather.description}")
        print(f"Humidity: {weather.humidity}%")
        print(f"Wind Speed: {weather.wind_speed} m/s")
        print(f"Date: {weather.date.strftime('%Y-%m-%d %H:%M:%S')}")
        print("====================================")
    
    def _display_forecast(self, forecast):
        """
        显示天气预报
        
        Args:
            forecast (list[WeatherData]): 天气预报数据列表
        """
        if not forecast:
            print("No forecast data available")
            return
        
        print(f"\n=== {len(forecast)}-Day Forecast for {forecast[0].city} ===")
        for day in forecast:
            print(f"\nDate: {day.date.strftime('%Y-%m-%d')}")
            print(f"Temperature: {day.temperature}°C")
            print(f"Description: {day.description}")
            print(f"Humidity: {day.humidity}%")
            print(f"Wind Speed: {day.wind_speed} m/s")
        print("====================================")
    
    def _display_trend(self, trend):
        """
        显示天气趋势
        
        Args:
            trend (dict): 天气趋势数据
        """
        print(f"\n=== Weather Trend for {trend['city']} ===")
        print(f"Days: {trend['days']}")
        print(f"Average Temperature: {trend['avg_temperature']:.1f}°C")
        print(f"Max Temperature: {trend['max_temperature']:.1f}°C")
        print(f"Min Temperature: {trend['min_temperature']:.1f}°C")
        print("\nTemperature Trend:")
        for i, temp in enumerate(trend['temperatures']):
            date = trend['dates'][i].strftime('%Y-%m-%d')
            print(f"{date}: {temp:.1f}°C - {trend['descriptions'][i]}")
        print("====================================")