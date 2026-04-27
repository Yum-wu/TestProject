#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Spider core class
"""

import threading
from queue import Queue
from .crawler import Crawler
from .parser import Parser
from .data_processor import DataProcessor


class Spider:
    """Spider core class"""

    def __init__(self, start_urls, max_depth=2, crawler=None,
                 parser=None, data_processor=None, progress_callback=None):
        """Initialize spider

        Args:
            start_urls: List of start URLs
            max_depth: Maximum crawl depth
            crawler: Custom crawler instance
            parser: Custom parser instance
            data_processor: Custom data processor instance
            progress_callback: Function to call for progress updates
        """
        self.start_urls = start_urls
        self.max_depth = max_depth
        self.crawler = crawler or Crawler()
        self.parser = parser or Parser()
        self.data_processor = data_processor or DataProcessor()
        self.visited_urls = set()
        self.url_queue = Queue()
        self.lock = threading.Lock()
        self.results = []
        self.progress_callback = progress_callback
        self.total_urls = 0
        self.processed_urls = 0

    def crawl(self):
        """Start crawling process"""
        # Add start URLs to queue
        for url in self.start_urls:
            self.add_url(url, 1)

        # Process queue
        while not self.url_queue.empty():
            url, depth = self.url_queue.get()
            if depth > self.max_depth:
                continue

            try:
                # Fetch page content
                content = self.crawler.fetch(url)
                if content:
                    # Process page
                    self.process_page(url, content)

                    # Parse links and add to queue
                    if depth < self.max_depth:
                        links = self.parser.parse_links(content, url)
                        for link in links:
                            self.add_url(link, depth + 1)
            except Exception as e:
                print(f"Error crawling {url}: {e}")
            finally:
                self.url_queue.task_done()

    def add_url(self, url, depth):
        """Add URL to crawl queue

        Args:
            url: URL to add
            depth: Current depth
        """
        with self.lock:
            if url not in self.visited_urls:
                self.visited_urls.add(url)
                self.url_queue.put((url, depth))
                self.total_urls += 1
                if self.progress_callback:
                    self.progress_callback(self.processed_urls, self.total_urls)

    def process_page(self, url, content):
        """Process crawled page

        Args:
            url: Page URL
            content: Page content
        """
        data = self.parser.parse_data(content)
        if data:
            result = {"url": url, "data": data}
            self.results.append(result)
            print(f"Processed {url}")
        
        # Update progress
        self.processed_urls += 1
        if self.progress_callback:
            self.progress_callback(self.processed_urls, self.total_urls)

    def get_results(self):
        """Get crawl results

        Returns:
            List of crawl results
        """
        return self.results

    def save_results(self, filename):
        """Save results to file

        Args:
            filename: Output filename
        """
        self.data_processor.save(self.results, filename)
