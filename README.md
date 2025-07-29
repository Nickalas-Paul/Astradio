# 🎵 Astradio - Life's Soundtrack

Transform astrological charts into personalized musical experiences.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   cd packages/types && npm install && cd ../..
   cd packages/astro-core && npm install && cd ../..
   cd packages/audio-mappings && npm install && cd ../..
   cd apps/api && npm install && cd ../..
   ```

2. Build packages:
   ```bash
   cd packages/types && npm run build && cd ../..
   cd packages/astro-core && npm run build && cd ../..
   cd packages/audio-mappings && npm run build && cd ../..
   ```

3. Start the API server:
   ```bash
   cd apps/api && npm run dev
   ```

4. In a new terminal, create and start the web app:
   ```bash
   cd apps/web
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
   npm install @supabase/supabase-js@^2.38.0 zustand@^4.4.7 framer-motion@^10.16.4 three@^0.158.0 @types/three@^0.158.0
   npm run dev
   ```

5. Open: http://localhost:3000

## Get API Keys

- **ProKerala**: https://api.prokerala.com (for astrology charts)
- **Supabase**: https://supabase.com (for database)

## Architecture

- **Frontend**: Next.js + React + Tailwind + Three.js
- **Backend**: Node.js + Express
- **Audio**: Tone.js + Custom mappings
- **Types**: Shared TypeScript interfaces
- **Astro Core**: Astrological chart generation
- **Audio Mappings**: Planetary sound mappings

Built for the 2-week MVP sprint.

## Project Structure

```
astradio/
├── packages/
│   ├── types/          # Shared TypeScript interfaces
│   ├── astro-core/     # Astrological chart generation
│   └── audio-mappings/ # Planetary sound mappings
├── apps/
│   ├── api/            # Express API server
│   └── web/            # Next.js web application
├── package.json        # Root workspace configuration
└── turbo.json          # Build system configuration
```

## Troubleshooting

If you encounter issues:

1. Make sure Node.js and npm are installed
2. Check that ports 3000 and 3001 are available
3. Ensure all dependencies are installed in each package
4. Try running the manual start commands above 