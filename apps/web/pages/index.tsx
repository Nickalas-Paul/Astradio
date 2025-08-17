import { useEffect, useMemo, useState, useRef } from "react";
import { play, stop, isPlaying, type MusicSpec } from "../lib/audioEngine";
import { drawNatalWheel } from "../lib/natalWheel";

type EPoint = { body: string; longitude: number; latitude: number; speed: number };
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Home() {
  const [health, setHealth] = useState<string>("checking…");
  const [ephemeris, setEphemeris] = useState<EPoint[]>([]);
  const [music, setMusic] = useState<MusicSpec | null>(null);
  const [loadingEph, setLoadingEph] = useState(false);
  const [loadingGen, setLoadingGen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bodies, setBodies] = useState<{name:string; lon:number}[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch(`${API}/health`).then(r=>r.json()).then(j=>setHealth(JSON.stringify(j))).catch(() => setHealth("unavailable"));
  }, []);

  // Load ephemeris on mount
  useEffect(() => {
    const loadEphemerisOnMount = async () => {
      try {
        const r = await fetch(`${API}/api/ephemeris/today`);
        const j = await r.json();
        if (j.ephemeris) {
          setEphemeris(j.ephemeris);
          // Map API payload → bodies: [{name, lon}]
          const mapped = j.ephemeris.map((p: EPoint)=>({ 
            name: p.body, 
            lon: p.longitude 
          }));
          setBodies(mapped);
        }
      } catch (e) {
        console.error('Failed to load ephemeris on mount:', e);
      }
    };
    loadEphemerisOnMount();
  }, []);

  // Draw natal wheel when bodies change
  useEffect(() => {
    if (!canvasRef.current || bodies.length === 0) return;
    drawNatalWheel(canvasRef.current, bodies);
  }, [bodies]);

  const loadEphemeris = async () => {
    setError(null); setLoadingEph(true);
    try {
      const r = await fetch(`${API}/api/ephemeris/today`);
      const j = await r.json();
      if (j.ephemeris) {
        setEphemeris(j.ephemeris);
        // Map API payload → bodies: [{name, lon}]
        const mapped = j.ephemeris.map((p: EPoint)=>({ 
          name: p.body, 
          lon: p.longitude 
        }));
        setBodies(mapped);
      }
    } catch (e: unknown) {
      setError((e as Error)?.message || "Failed to load ephemeris");
    } finally {
      setLoadingEph(false);
    }
  };

  const generate = async (genre: string) => {
    setError(null); setLoadingGen(genre);
    try {
      const r = await fetch(`${API}/api/audio/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ genre })
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Generation failed");
      setMusic(j.music);
      // autoplay on generate
      try { stop(); } catch {}
      play(j.music);
    } catch (e: unknown) {
      setError((e as Error)?.message || "Failed to generate");
    } finally {
      setLoadingGen(null);
    }
  };

  const ephRows = useMemo(() => {
    return ephemeris.slice().sort((a, b) => a.body.localeCompare(b.body));
  }, [ephemeris]);

  return (
    <main style={{padding:24,maxWidth:860,margin:"0 auto",fontFamily:"Inter, ui-sans-serif, system-ui"}}>
      <h1 style={{fontSize:28, marginBottom:8}}>ASTRADIO</h1>
      <p style={{opacity:0.8, marginBottom:16}}>API: {API}</p>
      <p style={{marginBottom:16}}>Health: {health}</p>

      {error && <div style={{background:"#fee", border:"1px solid #f99", padding:12, borderRadius:8, marginBottom:12}}>
        {error}
      </div>}

      {/* Natal Wheel */}
      <div style={{marginBottom:16, textAlign:"center"}}>
        <h2 style={{fontSize:20, marginBottom:8}}>Current Ephemeris</h2>
        <canvas 
          ref={canvasRef} 
          width={360} 
          height={360} 
          style={{
            maxWidth:360, 
            border:"1px solid #333", 
            borderRadius:8,
            background:"#000"
          }} 
        />
      </div>

      <div style={{display:"flex", gap:8, marginBottom:12}}>
        <button onClick={loadEphemeris} disabled={loadingEph}>
          {loadingEph ? "Loading ephemeris…" : "Load Today's Ephemeris"}
        </button>

        {["ambient","techno","world","hiphop"].map(g=>(
          <button key={g} onClick={()=>generate(g)} disabled={!!loadingGen}>
            {loadingGen === g ? `Generating ${g}…` : g}
          </button>
        ))}

        <button onClick={()=> (isPlaying() ? stop() : music && play(music))} disabled={!music}>
          {isPlaying() ? "Stop" : "Play"}
        </button>
      </div>

      {!!ephRows.length && (
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th style={{textAlign:"left", borderBottom:"1px solid #ddd", padding:"6px 4px"}}>Body</th>
              <th style={{textAlign:"right", borderBottom:"1px solid #ddd", padding:"6px 4px"}}>Longitude°</th>
              <th style={{textAlign:"right", borderBottom:"1px solid #ddd", padding:"6px 4px"}}>Latitude°</th>
              <th style={{textAlign:"right", borderBottom:"1px solid #ddd", padding:"6px 4px"}}>Speed°/d</th>
            </tr>
          </thead>
          <tbody>
            {ephRows.map((e)=>(
              <tr key={e.body}>
                <td style={{padding:"6px 4px", borderBottom:"1px solid #f2f2f2"}}>{e.body}</td>
                <td style={{padding:"6px 4px", textAlign:"right", borderBottom:"1px solid #f2f2f2"}}>{e.longitude.toFixed(2)}</td>
                <td style={{padding:"6px 4px", textAlign:"right", borderBottom:"1px solid #f2f2f2"}}>{e.latitude.toFixed(2)}</td>
                <td style={{padding:"6px 4px", textAlign:"right", borderBottom:"1px solid #f2f2f2"}}>{e.speed.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
