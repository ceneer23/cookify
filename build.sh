#!/bin/bash

# Build script for Render deployment
echo "Starting build process..."

# Navigate to backend directory and install dependencies
echo "Installing backend dependencies..."
cd "Cookify Backend"
npm install

echo "Build completed successfully!"