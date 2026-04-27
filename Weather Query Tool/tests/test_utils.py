import pytest
import os
from src.utils.config import ConfigManager
from src.utils.logger import Logger
from src.utils.cache import CacheManager


class TestConfigManager:
    """
    测试配置管理
    """
    
    def test_singleton(self):
        """
        测试单例模式
        """
        config1 = ConfigManager()
        config2 = ConfigManager()
        assert config1 is config2
    
    def test_get_api_key(self):
        """
        测试获取API密钥
        """
        config = ConfigManager()
        # 测试获取OpenWeather API密钥
        api_key = config.get_api_key('openweather')
        assert isinstance(api_key, str)
    
    def test_get_cache_timeout(self):
        """
        测试获取缓存超时时间
        """
        config = ConfigManager()
        timeout = config.get_cache_timeout()
        assert isinstance(timeout, int)
        assert timeout > 0
    
    def test_get_log_level(self):
        """
        测试获取日志级别
        """
        config = ConfigManager()
        log_level = config.get_log_level()
        assert isinstance(log_level, str)
        assert log_level in ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']


class TestLogger:
    """
    测试日志工具
    """
    
    def test_get_logger(self):
        """
        测试获取日志记录器
        """
        logger = Logger.get_logger(__name__)
        assert logger is not None
        assert logger.name == __name__
    
    def test_logger_singleton(self):
        """
        测试日志记录器单例模式
        """
        logger1 = Logger.get_logger('test')
        logger2 = Logger.get_logger('test')
        assert logger1 is logger2


class TestCacheManager:
    """
    测试缓存管理
    """
    
    def setup_method(self):
        """
        测试前的设置
        """
        self.cache = CacheManager()
        # 清空缓存
        self.cache.clear()
    
    def test_set_get(self):
        """
        测试设置和获取缓存
        """
        key = 'test_key'
        value = 'test_value'
        
        # 设置缓存
        self.cache.set(key, value)
        
        # 获取缓存
        retrieved_value = self.cache.get(key)
        assert retrieved_value == value
    
    def test_cache_expiration(self):
        """
        测试缓存过期
        """
        import time
        
        key = 'test_key'
        value = 'test_value'
        
        # 设置缓存
        self.cache.set(key, value)
        
        # 模拟过期
        # 注意：这里我们直接修改缓存的时间戳来模拟过期
        # 实际项目中，缓存过期是通过比较当前时间和缓存时间戳实现的
        if key in self.cache.cache:
            self.cache.cache[key] = (value, time.time() - 3601)  # 过期1秒
        
        # 获取缓存（应该返回None）
        retrieved_value = self.cache.get(key)
        assert retrieved_value is None
    
    def test_clear(self):
        """
        测试清空缓存
        """
        # 设置缓存
        self.cache.set('key1', 'value1')
        self.cache.set('key2', 'value2')
        
        # 清空缓存
        self.cache.clear()
        
        # 验证缓存已清空
        assert self.cache.get('key1') is None
        assert self.cache.get('key2') is None
    
    def test_delete(self):
        """
        测试删除缓存
        """
        # 设置缓存
        self.cache.set('key1', 'value1')
        self.cache.set('key2', 'value2')
        
        # 删除一个缓存
        self.cache.delete('key1')
        
        # 验证缓存已删除
        assert self.cache.get('key1') is None
        assert self.cache.get('key2') == 'value2'