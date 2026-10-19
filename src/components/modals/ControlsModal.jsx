// ============================================================================
// MODAL 6: CONTROLS GUIDE
// ============================================================================

export default function ControlsModal({
  showControlsHelp,
  setShowControlsHelp
}) {
  if (!showControlsHelp) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 className="text-lg font-black text-white">CONTROLS & GAMEPLAY GUIDE</h2>
          <button
            onClick={() => setShowControlsHelp(false)}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold"
          >
            Got It
          </button>
        </div>
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-800/70">
            <div className="font-bold text-cyan-400 uppercase mb-1">Batting Controls</div>
            <p className="mt-1">• <strong>A / D or Left / Right Arrows</strong> (or Aim Slider): Aim 360° shot direction.</p>
            <p className="mt-1">• <strong>S / W / E / Q</strong>: Select Defensive, Ground Drive, Lofted Six, or Sweep shot.</p>
            <p className="mt-1">• <strong>Spacebar or Left Click</strong>: Swing bat! Time your swing just as the ball bounces toward the crease.</p>
            <p className="mt-1">• <strong>Spacebar / Up Arrow</strong> (after hit): Call for a run between the wickets! Hold <strong>Shift</strong> to sprint.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/70">
            <div className="font-bold text-amber-400 uppercase mb-1">Bowling Controls</div>
            <p className="mt-1">• <strong>WASD / Arrow Keys</strong>: Position the glowing target ring on the pitch.</p>
            <p className="mt-1">• Choose from 7 delivery types (Fast Seam, Inswinger, Outswinger, Yorker, Bouncer, Off-Spin, Leg-Spin).</p>
            <p className="mt-1">• Press <strong>Spacebar</strong> to start the run-up, then press <strong>Spacebar</strong> again in the green sweet spot to release!</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/70">
            <div className="font-bold text-emerald-400 uppercase mb-1">Camera & Stadium Controls</div>
            <p className="mt-1">• Press <strong>C</strong> or use the Camera button to toggle Broadcast, Pro Batter, Bowler, and Ball Tracking cameras.</p>
            <p className="mt-1">• Toggle Day/Night lighting, Rain weather, and Fielding presets dynamically from the Top Bar.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
