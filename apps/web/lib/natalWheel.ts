export type Body = { name: string; lon: number }; // degrees 0..360
export function drawNatalWheel(canvas: HTMLCanvasElement, bodies: Body[]) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2, r = Math.min(cx, cy) - 10;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle = "#888"; ctx.lineWidth = 1;
  // outer circle
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
  // 12 houses ticks
  for (let i=0;i<12;i++){
    const a = (i/12)*Math.PI*2 - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a)* (r-10), cy + Math.sin(a)*(r-10));
    ctx.lineTo(cx + Math.cos(a)* r,      cy + Math.sin(a)* r);
    ctx.stroke();
  }
  // bodies
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "12px sans-serif";
  bodies.forEach(b=>{
    const a = (b.lon/360)*Math.PI*2 - Math.PI/2;
    const rr = r-20;
    const x = cx + Math.cos(a)*rr, y = cy + Math.sin(a)*rr;
    ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
    ctx.fillText(b.name, x, y-6);
  });
}
