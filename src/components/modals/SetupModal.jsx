import { Trophy } from 'lucide-react';
import { TEAMS } from '../../constants/cricketData';

// ============================================================================
// MODAL 1: MATCH SETUP & GAME MODE LAUNCHER
// ============================================================================

export default function SetupModal({
  gameScreen,
  gameMode,
  setGameMode,
  userTeamCode,
  setUserTeamCode,
  aiTeamCode,
  setAiTeamCode,
  totalOvers,
  setTotalOvers,
  timeOfDay,
  setTimeOfDay,
  setTossResult,
  setGameScreen,
  startNewMatch
}) {
  if (gameScreen !== 'SETUP') return null;

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-30">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40">
              <Trophy className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                3D PRO CRICKET CHAMPIONSHIP
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Realistic 60Hz Ball Physics • 11 Active Fielders • Hawk-Eye DRS • Full Cricket Rules
              </p>
            </div>
          </div>
        </div>

        {/* Game Mode Tabs */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {[
            { id: 'QUICK_MATCH', title: 'Quick Match', desc: 'Full Innings & Toss vs AI' },
            { id: 'SUPER_OVER', title: 'Super Over Chase', desc: '16 Runs Needed off 6 Balls!' },
            { id: 'PRACTICE', title: 'Net Practice', desc: 'Infinite Batting & Analytics' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setGameMode(m.id)}
              className={`p-3.5 rounded-2xl border text-left transition ${
                gameMode === m.id
                  ? 'bg-cyan-600/20 border-cyan-400 text-white shadow-lg'
                  : 'bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-black text-sm">{m.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Team Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Your Team
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(TEAMS).map((t) => (
                <button
                  key={t.code}
                  onClick={() => {
                    setUserTeamCode(t.code);
                    if (t.code === aiTeamCode) {
                      setAiTeamCode(t.code === 'IND' ? 'AUS' : 'IND');
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                    userTeamCode === t.code
                      ? 'border-cyan-400 bg-cyan-500/20 text-white'
                      : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-1 border border-white/20"
                    style={{ backgroundColor: t.primary }}
                  />
                  {t.code}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Opponent Team
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(TEAMS).map((t) => (
                <button
                  key={t.code}
                  disabled={t.code === userTeamCode}
                  onClick={() => setAiTeamCode(t.code)}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                    aiTeamCode === t.code
                      ? 'border-amber-400 bg-amber-500/20 text-white'
                      : t.code === userTeamCode
                      ? 'opacity-30 cursor-not-allowed border-slate-800 bg-slate-900'
                      : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-1 border border-white/20"
                    style={{ backgroundColor: t.primary }}
                  />
                  {t.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Match Overs & Atmosphere */}
        {gameMode === 'QUICK_MATCH' && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Match Format (Overs)
              </label>
              <div className="flex gap-2">
                {[2, 5, 10].map((ov) => (
                  <button
                    key={ov}
                    onClick={() => setTotalOvers(ov)}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs border transition ${
                      totalOvers === ov
                        ? 'bg-emerald-600/30 border-emerald-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {ov} Overs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Stadium Lighting
              </label>
              <div className="flex gap-2">
                {['DAY', 'SUNSET', 'NIGHT'].map((tod) => (
                  <button
                    key={tod}
                    onClick={() => setTimeOfDay(tod)}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs border transition ${
                      timeOfDay === tod
                        ? 'bg-amber-500/30 border-amber-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {tod}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Launch Button */}
        <div className="flex justify-end gap-3">
          {gameMode === 'QUICK_MATCH' ? (
            <button
              onClick={() => {
                setTossResult(null);
                setGameScreen('TOSS');
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-black text-base uppercase tracking-wider shadow-xl transition"
            >
              Proceed to Coin Toss →
            </button>
          ) : (
            <button
              onClick={() => startNewMatch(gameMode, userTeamCode, aiTeamCode, totalOvers, true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-black text-base uppercase tracking-wider shadow-xl transition"
            >
              Enter Stadium & Play Now →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
