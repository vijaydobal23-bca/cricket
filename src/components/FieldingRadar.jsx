// ============================================================================
// TOP-RIGHT: LIVE 2D FIELDING RADAR MINIMAP & AIM CONE
// ============================================================================

export default function FieldingRadar({
  gameScreen,
  fieldPreset,
  userRole,
  shotAimAngle,
  radarState
}) {
  if (gameScreen !== 'PLAYING') return null;

  return (
    <div className="absolute top-16 right-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-2xl shadow-xl pointer-events-auto z-10 hidden sm:block">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
        <span>Field Radar</span>
        <span className="text-cyan-400">{fieldPreset}</span>
      </div>
      <svg width="136" height="136" viewBox="-75 -75 150 150" className="rounded-full bg-emerald-950/90 border border-emerald-500/40">
        {/* Boundary Circle */}
        <circle cx="0" cy="0" r="68" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* 30-yard Circle */}
        <circle cx="0" cy="0" r="27.4" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="2 2" />
        {/* Central Pitch */}
        <rect x="-2.2" y="-10.5" width="4.4" height="21" fill="#d3ba93" rx="1" />

        {/* Shot Aim Cone when Batting */}
        {userRole === 'BATTING' && (
          <line
            x1="0"
            y1="8.8"
            x2={Math.sin(shotAimAngle) * 62}
            y2={8.8 - Math.cos(shotAimAngle) * 62}
            stroke="#22d3ee"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.75"
          />
        )}

        {/* 9 Outfielders + Keeper + Bowler */}
        {radarState.fielders.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.z} r="2.7" fill="#facc15" stroke="#000" strokeWidth="0.7" />
        ))}
        {/* Wicketkeeper & Bowler */}
        <circle cx="0" cy="13.8" r="2.7" fill="#fb923c" />
        <circle cx="0" cy="-10.5" r="2.7" fill="#fb923c" />

        {/* Striker & Non-Striker */}
        <circle cx="1.2" cy={radarState.strikerZ} r="2.8" fill="#38bdf8" />
        <circle cx="-1.2" cy={radarState.nonStrikerZ} r="2.8" fill="#38bdf8" />

        {/* Live Ball Position */}
        <circle cx={radarState.ball.x} cy={radarState.ball.z} r="3.4" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
      </svg>
    </div>
  );
}
