import time
from .config import ConfigManager


class CacheManager:
    """
    缓存管理类
    管理查询结果缓存，提高查询效率
    """
    
    def __init__(self):
        """
        初始化缓存管理器
        """
        self.config = ConfigManager()
        self.cache = {}
    
    def get(self, key):
        """
        获取缓存值
        
        Args:
            key (str): 缓存键
            
        Returns:
            Any: 缓存值，如果缓存不存在或已过期则返回None
        """
        if key in self.cache:
            value, timestamp = self.cache[key]
            if time.time() - timestamp < self.config.get_cache_timeout():
                return value
            else:
                # 缓存已过期，删除
                del self.cache[key]
        return None
    
    def set(self, key, value):
        """
        设置缓存值
        
        Args:
            key (str): 缓存键
            value (Any): 缓存值
        """
        self.cache[key] = (value, time.time())
    
    def clear(self):
        """
        清空缓存
        """
        self.cache.clear()
    
    def delete(self, key):
        """
        删除缓存
        
        Args:
            key (str): 缓存键
        """
        if key in self.cache:
            del self.cache[key]