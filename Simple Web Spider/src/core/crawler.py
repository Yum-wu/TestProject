#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Crawler class for fetching web pages
"""

from typing import Optional
from ..utils.http_client import HTTPClientInterface, HTTPClient


class Crawler:
    """Crawler class"""

    def __init__(self, http_client: Optional[HTTPClientInterface] = None, timeout: int = 10):
        """Initialize crawler

        Args:
            http_client: HTTP client instance
            timeout: HTTP request timeout (only used if http_client is None)
        """
        self.http_client = http_client or HTTPClient(timeout=timeout)

    def fetch(self, url):
        """Fetch web page content

        Args:
            url: URL to fetch

        Returns:
            Page content as string, or None if failed
        """
        response = self.http_client.get(url)
        if response:
            return response.text
        return None

    def handle_response(self, response):
        """Handle HTTP response

        Args:
            response: requests.Response object

        Returns:
            Response text or None
        """
        try:
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error handling response: {e}")
            return None
