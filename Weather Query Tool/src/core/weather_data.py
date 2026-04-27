from dataclasses import dataclass
from datetime import datetime


@dataclass
class WeatherData:
    """
    天气数据模型
    封装天气数据的结构
    """
    
    city: str  # 城市名称
    temperature: float  # 温度（摄氏度）
    description: str  # 天气描述
    humidity: int  # 湿度（百分比）
    wind_speed: float  # 风速（米/秒）
    date: datetime  # 日期时间
    
    def to_dict(self):
        """
        将天气数据转换为字典
        
        Returns:
            dict: 天气数据字典
        """
        return {
            'city': self.city,
            'temperature': self.temperature,
            'description': self.description,
            'humidity': self.humidity,
            'wind_speed': self.wind_speed,
            'date': self.date.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data):
        """
        从字典创建天气数据对象
        
        Args:
            data (dict): 天气数据字典
            
        Returns:
            WeatherData: 天气数据对象
        """
        return cls(
            city=data['city'],
            temperature=data['temperature'],
            description=data['description'],
            humidity=data['humidity'],
            wind_speed=data['wind_speed'],
            date=datetime.fromisoformat(data['date'])
        )