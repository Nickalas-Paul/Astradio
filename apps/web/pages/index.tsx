import { useEffect, useState } from "react";

interface HealthResponse {
  ok: boolean;
  service: string;
  uptime: number;
  timestamp: string;
  environment: string;
}

interface EphemerisResponse {
  ok: boolean;
  ephemeris: Array<{
    body: string;
    longitude: number;
    latitude: number;
    speed: number;
  }>;
  timestamp: string;
}

interface MusicResponse {
  ok: boolean;
  music: {
    tempo: number;
    key: string;
    scale: string;
    layers: Array<{ instrument: string; pattern: string }>;
  };
  ephemeris: Array<{
    body: string;
    longitude: number;
    latitude: number;
    speed: number;
  }>;
  timestamp: string;
}

export default function Home() {
  const [health, setHealth] = useState<string>("checking…");
  const [ephemeris, setEphemeris] = useState<EphemerisResponse | null>(null);
  const [music, setMusic] = useState<MusicResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    fetch(`${API}/health`)
      .then(r => r.json())
      .then((j: HealthResponse) => setHealth(JSON.stringify(j, null, 2)))
      .catch(e => setHealth(`Error: ${e.message}`));
  }, [API]);

  const loadEphemeris = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/ephemeris/today`);
      const j: EphemerisResponse = await r.json();
      setEphemeris(j);
    } catch (e: unknown) {
      const error = e as Error;
      setEphemeris({ ok: false, ephemeris: [], timestamp: '', error: error.message } as EphemerisResponse);
    } finally {
      setLoading(false);
    }
  };

  const generate = async (genre: string) => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/audio/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ genre })
      });
      const j: MusicResponse = await r.json();
      setMusic(j);
    } catch (e: unknown) {
      const error = e as Error;
      setMusic({ ok: false, music: { tempo: 0, key: '', scale: '', layers: [] }, ephemeris: [], timestamp: '', error: error.message } as MusicResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{padding: 24, maxWidth: 720, margin: "0 auto", fontFamily: 'system-ui'}}>
      <h1 style={{color: '#333', textAlign: 'center'}}>🎵 ASTRADIO</h1>
      <p style={{textAlign: 'center', color: '#666'}}>AI-Powered Astrological Music Generator</p>
      
      <div style={{marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8}}>
        <h3>API Status</h3>
        <p><strong>API URL:</strong> {API}</p>
        <p><strong>Health:</strong></p>
        <pre style={{background: '#fff', padding: 8, borderRadius: 4, fontSize: 12, overflow: 'auto'}}>
          {health}
        </pre>
      </div>

      <div style={{marginBottom: 24}}>
        <button 
          onClick={loadEphemeris}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Loading...' : 'Load Today\'s Ephemeris'}
        </button>
        
        {ephemeris && (
          <div style={{marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8}}>
            <h3>Ephemeris Data</h3>
            <pre style={{background: '#fff', padding: 8, borderRadius: 4, fontSize: 12, overflow: 'auto'}}>
              {JSON.stringify(ephemeris, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{marginBottom: 24}}>
        <h3>Generate Music</h3>
        <div style={{display: "flex", gap: 8, marginBottom: 16, flexWrap: 'wrap'}}>
          {["ambient", "techno", "world", "hip-hop"].map(g => (
            <button 
              key={g} 
              onClick={() => generate(g)}
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                textTransform: 'capitalize'
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {music && (
          <div style={{padding: 16, background: '#f5f5f5', borderRadius: 8}}>
            <h3>Generated Music</h3>
            <pre style={{background: '#fff', padding: 8, borderRadius: 4, fontSize: 12, overflow: 'auto'}}>
              {JSON.stringify(music, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{padding: 16, background: '#e8f4fd', borderRadius: 8, border: '1px solid #bee5eb'}}>
        <h3>🎯 What This Tests</h3>
        <ul style={{margin: 0, paddingLeft: 20}}>
          <li><strong>Health Check:</strong> API connectivity and basic status</li>
          <li><strong>Ephemeris:</strong> Current planetary positions from Swiss Ephemeris</li>
          <li><strong>Music Generation:</strong> Astrological data → musical parameters</li>
          <li><strong>End-to-End:</strong> Frontend ↔ Backend communication</li>
        </ul>
      </div>
    </main>
  );
}
