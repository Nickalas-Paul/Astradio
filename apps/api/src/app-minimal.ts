const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic CORS for Vercel
app.use(cors({
  origin: [/\.vercel\.app$/, /vercel\.app$/],
  credentials: false
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Minimal daily chart
app.get('/api/daily/:date', (req, res) => {
  const { date } = req.params;
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
  }
  
  res.json({
    success: true,
    data: {
      date,
      chart: { planets: {}, houses: {} },
      events: [],
      generated_at: new Date().toISOString()
    }
  });
});

// Genres
app.get('/api/genres', (req, res) => {
  res.json(['ambient', 'techno', 'world', 'hiphop']);
});

app.get('/api/status', (req, res) => {
  res.json({ swissephAvailable: false, status: 'minimal' });
});

app.listen(PORT, () => {
  console.log(`🎵 Astradio API (Minimal) on port ${PORT}`);
});

module.exports = app;