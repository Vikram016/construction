#!/bin/bash
# deploy.sh — Build and deploy BuildMart to Firebase Hosting
# Usage: bash deploy.sh

set -e  # stop on any error

echo ""
echo "🏗  BuildMart — Firebase Deploy"
echo "================================"

# Check .env exists
if [ ! -f ".env" ]; then
  echo "❌ .env file not found!"
  echo "   Copy .env.example to .env and fill in your values."
  exit 1
fi

echo "✅ .env found"

# Check firebase CLI installed
if ! command -v firebase &> /dev/null; then
  echo "❌ Firebase CLI not installed."
  echo "   Run: npm install -g firebase-tools"
  exit 1
fi

echo "✅ Firebase CLI found"

# Build
echo ""
echo "📦 Building..."
npm run build

echo ""
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Done! Your site is live."
