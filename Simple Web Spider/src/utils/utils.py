#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Utility functions
"""

import os
import re
from urllib.parse import urlparse


def validate_url(url):
    """Validate URL

    Args:
        url: URL to validate

    Returns:
        bool: True if URL is valid
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except Exception:
        return False


def sanitize_filename(filename):
    """Sanitize filename by removing invalid characters

    Args:
        filename: Original filename

    Returns:
        str: Sanitized filename
    """
    # Remove invalid characters
    sanitized = re.sub(r'[<>:"/\\|?*]', '', filename)
    # Remove leading/trailing whitespace
    sanitized = sanitized.strip()
    # Limit filename length
    max_length = 255
    if len(sanitized) > max_length:
        name, ext = os.path.splitext(sanitized)
        sanitized = name[:max_length - len(ext)] + ext
    return sanitized


def create_directory(directory):
    """Create directory if not exists

    Args:
        directory: Directory path
    """
    if not os.path.exists(directory):
        os.makedirs(directory)
