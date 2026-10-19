// ============================================================================
// BOTTOM TV BROADCAST SCOREBUG & LIVE COMMENTARY TICKER
// ============================================================================

export default function Scorebug({
  gameScreen,
  batTeam,
  matchState,
  oversFormatted,
  crr,
  rrr,
  runsNeeded,
  ballsRemaining,
  striker,
  nonStriker,
  bowler,
  commentary
}) {
  if (gameScreen !== 'PLAYING') return null;

  return (
    <div className="absolute bottom-2 left-3 right-3 bg-slate-950/92 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-20 pointer-events-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* 1. Team Score & Overs (3 cols) */}
        <div className="lg:col-span-3 flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner border border-white/15"
              style={{ backgroundColor: batTeam.primary }}
            >
              {batTeam.code}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-white">
                  {matchState.score}/{matchState.wickets}
                </span>
                <span className="text-xs font-bold text-cyan-400">
                  ({oversFormatted} / {matchState.totalOvers})
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                CRR: <span className="text-slate-200 font-bold">{crr}</span>
                {rrr && (
                  <span className="ml-2 text-amber-400 font-bold">
                    • REQ: {rrr} ({runsNeeded} off {ballsRemaining}b)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Striker & Non-Striker Stats (4 cols) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-2 px-4 py-2 text-xs">
          <div className="bg-slate-900/70 px-3 py-1.5 rounded-xl border border-cyan-500/30 flex items-center justify-between">
            <div className="truncate font-bold text-white flex items-center gap-1">
              <span className="text-cyan-400">*</span>
              <span>{striker.name}</span>
            </div>
            <div className="font-black text-cyan-300 ml-2">
              {striker.runs} <span className="text-[10px] font-normal text-slate-400">({striker.balls})</span>
            </div>
          </div>
          <div className="bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="truncate font-semibold text-slate-300">{nonStriker.name}</div>
            <div className="font-bold text-slate-300 ml-2">
              {nonStriker.runs} <span className="text-[10px] font-normal text-slate-500">({nonStriker.balls})</span>
            </div>
          </div>
        </div>

        {/* 3. Bowler & This Over Pills (5 cols) */}
        <div className="lg:col-span-5 flex items-center justify-between px-4 py-2 gap-3">
          <div className="text-xs">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <span>{bowler.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-300">
                {bowler.wickets}-{bowler.runsConceded} ({Math.floor(bowler.ballsBowled / 6)}.{bowler.ballsBowled % 6})
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">{commentary}</div>
          </div>

          {/* Ball-by-Ball Pills */}
          <div className="flex items-center gap-1 shrink-0">
            {matchState.thisOver.slice(-6).map((pill, idx) => {
              const isW = pill === 'W';
              const isBnd = pill === '4' || pill === '6';
              return (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black border ${
                    isW
                      ? 'bg-rose-600 border-rose-400 text-white'
                      : isBnd
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  {pill}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
