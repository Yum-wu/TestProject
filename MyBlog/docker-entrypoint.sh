#!/bin/sh
set -e

echo "Starting Nginx..."
nginx

echo "Starting API server..."
cd /app/server
node src/index.js
