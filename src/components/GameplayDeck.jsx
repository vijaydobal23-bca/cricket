import { Play, Zap, ArrowUp } from 'lucide-react';
import { SHOT_TYPES, DELIVERY_TYPES } from '../constants/cricketData';

// ============================================================================
// INTERACTIVE BATTING & BOWLING DECK (ABOVE SCOREBUG)
// ============================================================================

export default function GameplayDeck({
  gameScreen,
  userRole,
  selectedShot,
  setSelectedShot,
  shotAimAngle,
  setShotAimAngle,
  selectedDelivery,
  setSelectedDelivery,
  setPitchTarget,
  bowlingMeter,
  ballPhase,
  handleBowlButtonPress,
  onSwingBat,
  onCallRun,
  onCancelRun
}) {
  if (gameScreen !== 'PLAYING') return null;

  return (
    <div className="absolute bottom-28 left-3 right-3 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none z-20">
      {/* LEFT DECK: Shot Selection (Batting) OR Delivery Selection (Bowling) */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-2xl pointer-events-auto shadow-xl w-full md:w-auto">
        {userRole === 'BATTING' ? (
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
              <span>Select Shot Type (Keys: S / W / E / Q)</span>
              <span className="text-cyan-400">Aim: {Math.round((shotAimAngle * 180) / Math.PI)}°</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {SHOT_TYPES.map((st) => {
                const active = selectedShot === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedShot(st.id)}
                    className={`px-2.5 py-2 rounded-xl text-left border transition ${
                      active
                        ? 'bg-cyan-600/30 border-cyan-400 text-white shadow-inner'
                        : 'bg-slate-800/80 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400">
                        {st.key}
                      </span>
                      <span className="text-[10px] text-slate-400">{st.loftDeg}°</span>
                    </div>
                    <div className="text-xs font-bold mt-1 truncate">{st.label.split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>
            {/* Aim Slider for Touch & Mouse */}
            <div className="mt-2 flex items-center gap-2 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Off Side</span>
              <input
                type="range"
                min="-135"
                max="135"
                value={Math.round((shotAimAngle * 180) / Math.PI)}
                onChange={(e) => setShotAimAngle((Number(e.target.value) * Math.PI) / 180)}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Leg Side</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
              <span>Select Bowling Delivery</span>
              <span className="text-amber-400">Move Target: WASD / Arrows</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-w-xl">
              {DELIVERY_TYPES.map((del) => {
                const active = selectedDelivery.id === del.id;
                return (
                  <button
                    key={del.id}
                    onClick={() => {
                      setSelectedDelivery(del);
                      setPitchTarget((p) => ({ ...p, z: del.defaultZ }));
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                      active
                        ? 'bg-amber-500/25 border-amber-400 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>{del.name}</div>
                    <div className="text-[10px] text-amber-300 font-normal">{del.speedKph} km/h</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT DECK: Primary Action Buttons (Bowl / Play Shot / Run Between Wickets) */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {userRole === 'BOWLING' && bowlingMeter.active && (
          <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-2xl w-44">
            <div className="text-[10px] font-bold uppercase text-amber-400 mb-1 flex justify-between">
              <span>Release Timing</span>
              <span>{Math.round(bowlingMeter.value)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
              {/* Sweet spot band 75-92% */}
              <div className="absolute top-0 bottom-0 left-[75%] width-[17%] w-[17%] bg-emerald-500/50" />
              <div className="absolute top-0 bottom-0 left-[95%] w-[5%] bg-rose-500/80" />
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-rose-500 transition-none"
                style={{ width: `${bowlingMeter.value}%` }}
              />
            </div>
          </div>
        )}

        {ballPhase === 'READY' && (
          <button
            onClick={handleBowlButtonPress}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-900/50 transition transform active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>
              {userRole === 'BATTING'
                ? 'Bowl Next Ball (Space)'
                : bowlingMeter.active
                ? 'Release Ball Now! (Space)'
                : 'Start Run-Up (Space)'}
            </span>
          </button>
        )}

        {userRole === 'BATTING' && (ballPhase === 'RUNUP' || ballPhase === 'IN_FLIGHT') && (
          <button
            onClick={onSwingBat}
            className="flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base uppercase tracking-wider shadow-xl shadow-cyan-900/50 animate-pulse transition transform active:scale-95"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>SWING BAT! (SPACE / CLICK)</span>
          </button>
        )}

        {ballPhase === 'IN_PLAY' && (
          <div className="flex items-center gap-2">
            <button
              onClick={onCallRun}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg transition"
            >
              <ArrowUp className="w-4 h-4" />
              <span>CALL RUN! (SPACE)</span>
            </button>
            <button
              onClick={onCancelRun}
              className="px-4 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
