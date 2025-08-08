# Astradio - AI-Powered Astrological Music Generator

A unified, streamlined AI music generator that creates unique compositions based on astrological data using the Swiss Ephemeris API.

## 🚀 Quick Start

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
astradio/
├── apps/
│   ├── api/          # Backend API (Express + TypeScript)
│   └── web/          # Frontend (Next.js + React)
├── packages/
│   ├── astro-core/   # Astrological calculations
│   ├── audio-mappings/ # Audio generation logic
│   └── types/        # Shared TypeScript types
└── package.json      # Root workspace configuration
```

## 🎯 Core Features

- **Real-time astrological data** from Swiss Ephemeris API
- **Dynamic music generation** based on planetary positions
- **Genre switching** (ambient, techno, world, hip-hop)
- **Daily chart generation** with automatic audio
- **Birth chart analysis** with personalized compositions
- **Chart comparison** and overlay functionality

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
1. Clone the repository
2. Run `npm run install:all`
3. Copy `.env.example` to `.env` and configure
4. Run `npm run dev` to start both frontend and backend

### API Endpoints

- `GET /health` - Health check
- `GET /api/daily/:date` - Daily chart generation
- `POST /api/charts/generate` - Birth chart generation
- `POST /api/audio/generate` - Audio generation
- `GET /api/audio/daily` - Daily audio generation

### Frontend Routes

- `/` - Landing page with daily chart
- `/chart` - Chart generation interface
- `/audio-lab` - Audio experimentation
- `/sandbox` - Sandbox mode

## 🚀 Deployment

### Backend (Render)
```bash
npm run build:api
```

### Frontend (Vercel)
```bash
npm run build:web
```

## 🎵 Audio Generation

The system generates music using:
- **Tone.js** for audio synthesis
- **Swiss Ephemeris** for precise astrological calculations
- **Dynamic genre mapping** based on planetary aspects
- **Real-time composition** algorithms

## 🔮 Astrological Features

- **Planetary positions** calculated with Swiss Ephemeris
- **House cusps** and aspect calculations
- **Daily transits** and progressions
- **Chart comparisons** and synastry

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🆘 Support

For issues and questions, please check the documentation or create an issue in the repository.
