// ============================================================================
// MODAL 4: FULL SCORECARD & WAGON WHEEL
// ============================================================================

export default function ScorecardModal({
  showScorecardModal,
  setShowScorecardModal,
  batTeam,
  bowlTeam,
  matchState,
  oversFormatted
}) {
  if (!showScorecardModal) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[88vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-black text-white">
              {batTeam.name} Batting Scorecard — {matchState.score}/{matchState.wickets} ({oversFormatted} Ov)
            </h2>
            <p className="text-xs text-slate-400">
              Extras: {matchState.extras.wides + matchState.extras.noBalls} (Wides: {matchState.extras.wides}, No-Balls: {matchState.extras.noBalls}) • Partnership: {matchState.partnership.runs} ({matchState.partnership.balls})
            </p>
          </div>
          <button
            onClick={() => setShowScorecardModal(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Batting Table */}
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="py-2">Batter</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">R</th>
                  <th className="py-2 text-right">B</th>
                  <th className="py-2 text-right">4s</th>
                  <th className="py-2 text-right">6s</th>
                  <th className="py-2 text-right">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {matchState.battingCard.map((p, idx) => {
                  const isStriker = idx === matchState.strikerIdx && p.status === 'not out';
                  const sr = p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={p.id} className={isStriker ? 'bg-cyan-950/30 font-bold text-white' : 'text-slate-300'}>
                      <td className="py-2">
                        {p.name} {isStriker && <span className="text-cyan-400">*</span>}
                      </td>
                      <td className="py-2 text-slate-400">{p.status === 'out' ? p.outDesc : p.status}</td>
                      <td className="py-2 text-right font-bold">{p.runs}</td>
                      <td className="py-2 text-right">{p.balls}</td>
                      <td className="py-2 text-right">{p.fours}</td>
                      <td className="py-2 text-right">{p.sixes}</td>
                      <td className="py-2 text-right">{sr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Bowling Figures */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mt-6 mb-2">
              {bowlTeam.name} Bowling Figures
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="py-1.5">Bowler</th>
                  <th className="py-1.5 text-right">O</th>
                  <th className="py-1.5 text-right">R</th>
                  <th className="py-1.5 text-right">W</th>
                  <th className="py-1.5 text-right">ECON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {matchState.bowlingCard.slice(6).map((b) => {
                  const ov = `${Math.floor(b.ballsBowled / 6)}.${b.ballsBowled % 6}`;
                  const econ = b.ballsBowled > 0 ? ((b.runsConceded / b.ballsBowled) * 6).toFixed(2) : '0.00';
                  return (
                    <tr key={b.id} className="text-slate-300">
                      <td className="py-1.5 font-semibold">{b.name}</td>
                      <td className="py-1.5 text-right">{ov}</td>
                      <td className="py-1.5 text-right">{b.runsConceded}</td>
                      <td className="py-1.5 text-right font-bold text-amber-400">{b.wickets}</td>
                      <td className="py-1.5 text-right">{econ}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 360° Wagon Wheel Chart */}
          <div className="flex flex-col items-center justify-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              360° Scoring Wagon Wheel
            </div>
            <svg width="210" height="210" viewBox="-75 -75 150 150" className="rounded-full bg-emerald-950 border border-emerald-500/40">
              <circle cx="0" cy="0" r="68" fill="none" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="0" cy="0" r="27.4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 2" />
              <rect x="-2" y="-10" width="4" height="20" fill="#d3ba93" />
              {matchState.wagonWheel.map((w, i) => (
                <line
                  key={i}
                  x1="0"
                  y1="8.8"
                  x2={Math.sin(w.angle) * w.dist}
                  y2={8.8 - Math.cos(w.angle) * w.dist}
                  stroke={w.runs === 6 ? '#f43f5e' : w.runs === 4 ? '#22d3ee' : '#facc15'}
                  strokeWidth={w.runs >= 4 ? '2.4' : '1.5'}
                  strokeLinecap="round"
                />
              ))}
            </svg>
            <div className="flex gap-4 text-[11px] mt-3">
              <span className="flex items-center gap-1 text-yellow-400">● 1s/2s/3s</span>
              <span className="flex items-center gap-1 text-cyan-400">● Fours</span>
              <span className="flex items-center gap-1 text-rose-400">● Sixes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
