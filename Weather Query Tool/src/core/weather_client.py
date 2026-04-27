from abc import ABC, abstractmethod


class WeatherClient(ABC):
    """
    天气API客户端抽象基类
    定义天气API客户端的通用接口
    """
    
    @abstractmethod
    def get_current_weather(self, city):
        """
        获取指定城市的当前天气
        
        Args:
            city (str): 城市名称
            
        Returns:
            WeatherData: 天气数据对象
        """
        pass
    
    @abstractmethod
    def get_forecast(self, city, days=5):
        """
        获取指定城市的天气预报
        
        Args:
            city (str): 城市名称
            days (int): 预报天数
            
        Returns:
            list[WeatherData]: 天气预报数据列表
        """
        pass