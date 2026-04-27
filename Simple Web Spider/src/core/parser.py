#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Parser class for parsing web page content
"""

from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse


class Parser:
    """Parser class"""

    def __init__(self):
        """Initialize parser"""
        pass

    def parse_links(self, content, base_url):
        """Parse links from page content

        Args:
            content: Page content
            base_url: Base URL for resolving relative links

        Returns:
            List of absolute URLs
        """
        links = []
        try:
            soup = BeautifulSoup(content, 'lxml')
            for a_tag in soup.find_all('a', href=True):
                href = a_tag['href']
                # Resolve relative URL
                absolute_url = urljoin(base_url, href)
                # Validate URL
                parsed = urlparse(absolute_url)
                if parsed.scheme in ('http', 'https'):
                    links.append(absolute_url)
        except Exception as e:
            print(f"Error parsing links: {e}")
        return links

    def parse_data(self, content):
        """Parse data from page content

        Args:
            content: Page content

        Returns:
            Dictionary of parsed data
        """
        data = {}
        try:
            soup = BeautifulSoup(content, 'lxml')

            # Extract title
            title = soup.find('title')
            if title:
                data['title'] = title.text.strip()

            # Extract meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc and 'content' in meta_desc.attrs:
                data['description'] = meta_desc['content'].strip()

            # Extract headings
            headings = {}
            for level in range(1, 7):
                heading_tags = soup.find_all(f'h{level}')
                if heading_tags:
                    headings[f'h{level}'] = [h.text.strip()
                                             for h in heading_tags]
            if headings:
                data['headings'] = headings

            # Extract paragraphs
            paragraphs = [
                p.text.strip() for p in soup.find_all('p')
                if p.text.strip()
            ]
            if paragraphs:
                data['paragraphs'] = paragraphs

        except Exception as e:
            print(f"Error parsing data: {e}")
        return data
