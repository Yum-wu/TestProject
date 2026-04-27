import os
from dotenv import load_dotenv


class ConfigManager:
    """
    配置管理类
    使用单例模式管理应用配置
    """
    
    _instance = None
    
    def __new__(cls):
        """
        单例模式实现
        """
        if cls._instance is None:
            cls._instance = super(ConfigManager, cls).__new__(cls)
            cls._instance._load_config()
        return cls._instance
    
    def _load_config(self):
        """
        加载配置
        """
        # 加载.env文件
        config_path = os.path.join(os.path.dirname(__file__), '..', '..', 'config', 'config.env')
        load_dotenv(config_path)
        
        # 从环境变量加载配置
        self.openweather_api_key = os.getenv('OPENWEATHER_API_KEY', '')
        self.cache_timeout = int(os.getenv('CACHE_TIMEOUT', '3600'))
        self.log_level = os.getenv('LOG_LEVEL', 'INFO')
    
    def get_api_key(self, service):
        """
        获取API密钥
        
        Args:
            service (str): 服务名称
            
        Returns:
            str: API密钥
        """
        if service.lower() == 'openweather':
            return self.openweather_api_key
        return ''
    
    def get_cache_timeout(self):
        """
        获取缓存超时时间
        
        Returns:
            int: 缓存超时时间（秒）
        """
        return self.cache_timeout
    
    def get_log_level(self):
        """
        获取日志级别
        
        Returns:
            str: 日志级别
        """
        return self.log_level