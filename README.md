# TypeRace - Real-time Typing Competition

A multiplayer typing game built with Next.js where players compete in real-time to type sentences as fast and accurately as possible.

## ✨ Features

✅ Real-time multiplayer using Pusher WebSocket  
✅ 60-second rounds with automatic rotation  
✅ WPM and Accuracy tracking  
✅ Player stats persistence (PostgreSQL + Prisma)  
✅ Sorting, pagination, URL persistence  
✅ Error boundaries and loading states  
✅ In-memory caching (30s TTL)  
✅ Rate limiting (100 req/min)  
✅ Input validation and sanitization  
✅ Health check endpoint  
✅ Unit tests (16 tests with Vitest)

## 🛠️ Tech Stack

- **Next.js 15** - App Router, Server Components
- **TypeScript 5** - Strict mode
- **Pusher Channels** - Real-time WebSocket
- **Prisma + PostgreSQL** - Database ORM
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Vitest** - Unit testing

## 🚀 Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Setup environment variables
cp .env.example .env
# Add your Pusher credentials and DATABASE_URL

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run unit tests
npm run db:studio    # Prisma Studio
```

## 🎯 How It Works

**Real-time Flow:**
```
Player types → API updates DB → Pusher broadcasts → All clients update
```

**Metrics:**
- **WPM**: `(correct_chars / 5) / time_minutes`
- **Accuracy**: `correct_keystrokes / total_keystrokes`

## 🧪 Testing

```bash
npm test -- --run    # 16 unit tests
```

Tests cover: Button, Timer, utils, validation

## 🤖 AI Usage

AI (GitHub Copilot) was used only for generating base Tailwind CSS styles and UI component styling. All core functionality, architecture, real-time logic, database design, API routes, state management, and business logic were implemented manually.

## 📦 Project Structure

```
src/
├── app/api/          # API routes (game, progress, stats, health)
├── components/       # React components
├── hooks/            # Custom hooks (Pusher)
├── lib/              # Utils (cache, rate-limit, validation, logger)
└── store/            # Zustand state
```
