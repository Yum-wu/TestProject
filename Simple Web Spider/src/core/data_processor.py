#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
DataProcessor class for processing and saving crawled data
"""

import json
import csv


class DataProcessor:
    """DataProcessor class"""

    def __init__(self, output_format='json'):
        """Initialize data processor

        Args:
            output_format: Output format (json or csv)
        """
        self.output_format = output_format

    def process(self, data):
        """Process data

        Args:
            data: Raw data

        Returns:
            Processed data
        """
        # Simple processing - can be extended
        return data

    def save(self, data, filename):
        """Save data to file

        Args:
            data: Data to save
            filename: Output filename
        """
        if self.output_format == 'json':
            self._save_json(data, filename)
        elif self.output_format == 'csv':
            self._save_csv(data, filename)
        else:
            print(f"Unsupported output format: {self.output_format}")

    def _save_json(self, data, filename):
        """Save data as JSON

        Args:
            data: Data to save
            filename: Output filename
        """
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Data saved to {filename}")
        except Exception as e:
            print(f"Error saving JSON: {e}")

    def _save_csv(self, data, filename):
        """Save data as CSV

        Args:
            data: Data to save
            filename: Output filename
        """
        try:
            if not data:
                print("No data to save")
                return

            # Extract headers
            headers = ['url', 'title', 'description']

            with open(filename, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=headers)
                writer.writeheader()

                for item in data:
                    row = {'url': item.get('url', '')}
                    if 'data' in item:
                        row['title'] = item['data'].get('title', '')
                        row['description'] = item['data'].get(
                            'description', ''
                        )
                    writer.writerow(row)
            print(f"Data saved to {filename}")
        except Exception as e:
            print(f"Error saving CSV: {e}")
