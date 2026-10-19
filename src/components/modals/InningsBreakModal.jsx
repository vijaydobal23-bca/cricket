import { Award } from 'lucide-react';

// ============================================================================
// MODAL 3: INNINGS BREAK & MATCH OVER SUMMARY
// ============================================================================

export default function InningsBreakModal({
  gameScreen,
  batTeam,
  matchState,
  oversFormatted,
  startSecondInnings,
  setShowScorecardModal,
  setGameScreen
}) {
  if (gameScreen !== 'INNINGS_BREAK' && gameScreen !== 'MATCH_OVER') return null;

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-30">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-center shadow-2xl">
        <Award className="w-12 h-12 text-amber-400 mx-auto mb-2" />
        <h2 className="text-2xl font-black text-white">
          {gameScreen === 'INNINGS_BREAK' ? 'END OF 1ST INNINGS' : 'MATCH COMPLETED'}
        </h2>
        <p className="text-sm text-cyan-400 font-bold mt-1">
          {gameScreen === 'INNINGS_BREAK'
            ? `${batTeam.name} posted ${matchState.score}/${matchState.wickets} in ${oversFormatted} overs.`
            : matchState.winnerText}
        </p>

        <div className="my-5 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left text-xs space-y-2">
          <div className="flex justify-between font-bold text-slate-300">
            <span>{batTeam.name} Total:</span>
            <span className="text-white text-sm">
              {matchState.score}/{matchState.wickets} ({oversFormatted} ov)
            </span>
          </div>
          {matchState.target && (
            <div className="flex justify-between font-bold text-amber-400">
              <span>Target Score:</span>
              <span>{matchState.target} Runs</span>
            </div>
          )}
        </div>

        {gameScreen === 'INNINGS_BREAK' ? (
          <button
            onClick={startSecondInnings}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-black text-sm uppercase tracking-wider"
          >
            Start 2nd Innings Chase →
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setShowScorecardModal(true)}
              className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold text-xs uppercase"
            >
              View Full Scorecard
            </button>
            <button
              onClick={() => setGameScreen('SETUP')}
              className="flex-1 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 font-black text-xs uppercase"
            >
              Play New Match
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
