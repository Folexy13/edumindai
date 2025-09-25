#!/bin/sh
set -e

echo "🚀 Starting EduMind AI Backend..."

echo "📊 Running database migrations..."
npx prisma db push

echo "🌱 Seeding database with demo data..."
npm run db:seed || echo "⚠️  Seeding failed or already completed"

echo "🎯 Starting application server..."
exec npm start