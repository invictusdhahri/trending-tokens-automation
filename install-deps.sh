#!/bin/bash

# Script to fix Homebrew permissions and install canvas dependencies

echo "🔧 Fixing Homebrew permissions..."
sudo chown -R $(whoami) /opt/homebrew/Cellar

echo ""
echo "📦 Installing system dependencies for canvas..."
brew install pkg-config pango librsvg

echo ""
echo "✅ System dependencies installed!"
echo ""
echo "Now run: pnpm install"
