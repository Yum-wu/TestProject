import logging
import os
from .config import ConfigManager


class Logger:
    """
    日志工具类
    """
    
    _loggers = {}
    
    @classmethod
    def get_logger(cls, name):
        """
        获取日志记录器
        
        Args:
            name (str): 日志记录器名称
            
        Returns:
            logging.Logger: 日志记录器
        """
        if name not in cls._loggers:
            cls._loggers[name] = cls._create_logger(name)
        return cls._loggers[name]
    
    @classmethod
    def _create_logger(cls, name):
        """
        创建日志记录器
        
        Args:
            name (str): 日志记录器名称
            
        Returns:
            logging.Logger: 日志记录器
        """
        config = ConfigManager()
        logger = logging.getLogger(name)
        logger.setLevel(getattr(logging, config.get_log_level()))
        
        # 创建控制台处理器
        console_handler = logging.StreamHandler()
        console_handler.setLevel(getattr(logging, config.get_log_level()))
        
        # 创建格式化器
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        console_handler.setFormatter(formatter)
        
        # 添加处理器
        logger.addHandler(console_handler)
        
        return logger