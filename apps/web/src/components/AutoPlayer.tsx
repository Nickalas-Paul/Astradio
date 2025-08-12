'use client';
import { useEffect, useRef, useState } from 'react';

export default function AutoPlayer({ src }: { src: string }) {
  const a = useRef<HTMLAudioElement>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    let dead = false;
    (async () => {
      try { 
        if (!a.current) return;
        a.current.src = src;
        await a.current.play();
      } catch { 
        if (!dead) setNeedsTap(true); 
      }
    })();
    return () => { 
      dead = true; 
      a.current?.pause(); 
    };
  }, [src]);

  return (
    <>
      <audio ref={a} preload="auto" />
      {needsTap && (
        <button 
          className="fixed inset-0 grid place-items-center bg-black/70 text-white text-xl z-50"
          onClick={async () => { 
            try { 
              await a.current?.play(); 
              setNeedsTap(false); 
            } catch {} 
          }}
        >
          Start soundtrack
        </button>
      )}
    </>
  );
}
