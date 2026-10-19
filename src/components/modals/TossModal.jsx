import { TEAMS } from '../../constants/cricketData';

// ============================================================================
// MODAL 2: INTERACTIVE COIN TOSS
// ============================================================================

export default function TossModal({
  gameScreen,
  userTeamCode,
  aiTeamCode,
  totalOvers,
  tossCall,
  setTossCall,
  tossResult,
  setTossResult,
  startNewMatch
}) {
  if (gameScreen !== 'TOSS') return null;

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-30">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-1">OFFICIAL COIN TOSS</h2>
        <p className="text-xs text-slate-400 mb-6">
          {TEAMS[userTeamCode].name} vs {TEAMS[aiTeamCode].name} • {totalOvers} Overs Match
        </p>

        {!tossResult ? (
          <div>
            <div className="flex justify-center gap-4 mb-6">
              {['HEADS', 'TAILS'].map((side) => (
                <button
                  key={side}
                  onClick={() => setTossCall(side)}
                  className={`px-6 py-3 rounded-2xl font-black text-sm border transition ${
                    tossCall === side
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {side}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const landed = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
                const userWon = landed === tossCall;
                setTossResult({ landed, userWon });
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 font-black text-sm uppercase tracking-wider text-white shadow-lg"
            >
              Flip Coin
            </button>
          </div>
        ) : (
          <div>
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 mb-6">
              <div className="text-xs uppercase font-bold text-amber-400">
                Coin Landed: {tossResult.landed}
              </div>
              <div className="text-lg font-black text-white mt-1">
                {tossResult.userWon
                  ? `You won the toss! Choose to Bat or Bowl first:`
                  : `${TEAMS[aiTeamCode].name} won the toss and elected to Bowl first!`}
              </div>
            </div>

            {tossResult.userWon ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => startNewMatch('QUICK_MATCH', userTeamCode, aiTeamCode, totalOvers, true)}
                  className="py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 font-black text-sm uppercase"
                >
                  Bat First
                </button>
                <button
                  onClick={() => startNewMatch('QUICK_MATCH', userTeamCode, aiTeamCode, totalOvers, false)}
                  className="py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-black text-sm uppercase"
                >
                  Bowl First
                </button>
              </div>
            ) : (
              <button
                onClick={() => startNewMatch('QUICK_MATCH', userTeamCode, aiTeamCode, totalOvers, true)}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-black text-sm uppercase"
              >
                Start 1st Innings →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
