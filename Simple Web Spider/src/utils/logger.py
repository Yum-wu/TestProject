#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Logger utilities
"""

import logging
import os


def setup_logger(name, log_file='spider.log', level=logging.INFO):
    """Setup logger

    Args:
        name: Logger name
        log_file: Log file path
        level: Log level

    Returns:
        Logger instance
    """
    # Create logs directory if not exists
    log_dir = os.path.dirname(log_file)
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Create file handler
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setFormatter(formatter)

    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


# Default logger
logger = setup_logger('spider')
