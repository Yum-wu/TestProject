#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
HTTP client utilities
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import requests


class HTTPClientInterface(ABC):
    """HTTP client interface"""
    
    @abstractmethod
    def get(self, url: str, params: Optional[Dict[str, Any]] = None) -> Optional[requests.Response]:
        """Send GET request
        
        Args:
            url: Request URL
            params: Query parameters
            
        Returns:
            Response object, None if failed
        """
        pass
    
    @abstractmethod
    def post(self, url: str, data: Optional[Dict[str, Any]] = None, 
             json: Optional[Dict[str, Any]] = None) -> Optional[requests.Response]:
        """Send POST request
        
        Args:
            url: Request URL
            data: Form data
            json: JSON data
            
        Returns:
            Response object, None if failed
        """
        pass


class HTTPClient(HTTPClientInterface):
    """HTTP client class"""

    def __init__(self, timeout: int = 10, user_agent: Optional[str] = None):
        """Initialize HTTP client

        Args:
            timeout: Request timeout
            user_agent: Custom user agent
        """
        self.timeout = timeout
        self.session = requests.Session()
        
        default_user_agent = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                            'AppleWebKit/537.36 (KHTML, like Gecko) '
                            'Chrome/91.0.4472.124 Safari/537.36')
        self.session.headers.update({
            'User-Agent': user_agent or default_user_agent
        })

    def get(self, url: str, params: Optional[Dict[str, Any]] = None) -> Optional[requests.Response]:
        """Send GET request

        Args:
            url: Request URL
            params: Query parameters

        Returns:
            Response object, None if failed
        """
        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            print(f"HTTP GET error for {url}: {e}")
            return None

    def post(self, url: str, data: Optional[Dict[str, Any]] = None, 
             json: Optional[Dict[str, Any]] = None) -> Optional[requests.Response]:
        """Send POST request

        Args:
            url: Request URL
            data: Form data
            json: JSON data

        Returns:
            Response object, None if failed
        """
        try:
            response = self.session.post(
                url, data=data, json=json, timeout=self.timeout
            )
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            print(f"HTTP POST error for {url}: {e}")
            return None
    
    def close(self):
        """Close session"""
        self.session.close()
