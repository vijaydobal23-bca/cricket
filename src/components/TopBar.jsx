import {
  Trophy, Camera, Shield, Sun, Moon, CloudRain,
  BarChart2, Eye, HelpCircle, Volume2, VolumeX
} from 'lucide-react';

// ============================================================================
// TOP BAR: CAMERA, WEATHER, FIELD PRESETS & MODAL BUTTONS
// ============================================================================

export default function TopBar({
  gameMode,
  matchState,
  cameraMode,
  setCameraMode,
  fieldPreset,
  setFieldPreset,
  timeOfDay,
  setTimeOfDay,
  weather,
  setWeather,
  setShowScorecardModal,
  setShowHawkEyeModal,
  setShowControlsHelp,
  toggleMute,
  muted,
  setGameScreen
}) {
  return (
    <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
      {/* Left: Brand & Mode Badge */}
      <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl pointer-events-auto shadow-lg">
        <Trophy className="w-5 h-5 text-amber-400" />
        <div>
          <div className="text-xs font-black tracking-wider uppercase text-amber-400">
            PRO CRICKET 3D
          </div>
          <div className="text-[11px] text-slate-300 font-medium">
            {gameMode === 'PRACTICE'
              ? 'Net Practice Session'
              : gameMode === 'SUPER_OVER'
              ? 'Super Over Challenge'
              : `${matchState.innings === 1 ? '1st' : '2nd'} Innings • T${matchState.totalOvers}`}
          </div>
        </div>

        {matchState.freeHit && (
          <span className="ml-2 px-2.5 py-0.5 text-xs font-extrabold uppercase bg-rose-600 text-white rounded-full animate-pulse">
            FREE HIT!
          </span>
        )}
      </div>

      {/* Center: Quick Stadium & Camera Controls */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl pointer-events-auto shadow-lg">
        {/* Camera Selector */}
        <button
          onClick={() => {
            const modes = ['BROADCAST', 'PRO_BATTER', 'BOWLER', 'BALL_FOLLOW'];
            setCameraMode(modes[(modes.indexOf(cameraMode) + 1) % modes.length]);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition"
          title="Cycle Camera Angle (C)"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span>{cameraMode.replace('_', ' ')}</span>
        </button>

        {/* Field Placement Preset */}
        <button
          onClick={() => {
            const presets = ['Attacking', 'Balanced', 'Defensive'];
            setFieldPreset(presets[(presets.indexOf(fieldPreset) + 1) % presets.length]);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition"
          title="Change Fielding Preset"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Field: {fieldPreset}</span>
        </button>

        {/* Time of Day */}
        <button
          onClick={() => {
            const times = ['DAY', 'SUNSET', 'NIGHT'];
            setTimeOfDay(times[(times.indexOf(timeOfDay) + 1) % times.length]);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition"
        >
          {timeOfDay === 'NIGHT' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{timeOfDay}</span>
        </button>

        {/* Weather Toggle */}
        <button
          onClick={() => setWeather((w) => (w === 'CLEAR' ? 'RAIN' : 'CLEAR'))}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            weather === 'RAIN' ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>{weather}</span>
        </button>

        {/* Scorecard Modal Button */}
        <button
          onClick={() => setShowScorecardModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-xs font-bold transition"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Scorecard</span>
        </button>

        {/* Hawk-Eye DRS Modal Button */}
        <button
          onClick={() => setShowHawkEyeModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-xs font-bold transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Hawk-Eye DRS</span>
        </button>

        {/* Controls Help */}
        <button
          onClick={() => setShowControlsHelp(true)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          title="Controls Guide"
        >
          <HelpCircle className="w-4 h-4 text-slate-300" />
        </button>

        {/* Audio Mute */}
        <button
          onClick={toggleMute}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          title="Toggle Stadium Audio"
        >
          {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Match Setup Menu */}
        <button
          onClick={() => setGameScreen('SETUP')}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
        >
          Menu
        </button>
      </div>
    </div>
  );
}
