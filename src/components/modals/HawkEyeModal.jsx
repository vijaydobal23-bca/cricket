import { Eye } from 'lucide-react';

// ============================================================================
// MODAL 5: DRS HAWK-EYE BALL TRACKING SYSTEM
// ============================================================================

export default function HawkEyeModal({
  showHawkEyeModal,
  setShowHawkEyeModal,
  lastHawkEyeData
}) {
  if (!showHawkEyeModal) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-xl w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black uppercase tracking-wide text-white">
              DRS HAWK-EYE BALL TRACKER
            </h2>
          </div>
          <button
            onClick={() => setShowHawkEyeModal(false)}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold"
          >
            Close
          </button>
        </div>

        {lastHawkEyeData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400">Pitching</div>
                <div className="text-sm font-black text-emerald-400 mt-0.5">
                  {Math.abs(lastHawkEyeData.pitchPoint.x) < 0.14 ? 'IN LINE' : 'OUTSIDE OFF'}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400">Impact</div>
                <div className="text-sm font-black text-emerald-400 mt-0.5">
                  {Math.abs(lastHawkEyeData.impactPoint.x) < 0.14 ? 'IN LINE' : 'UMPIRE’S CALL'}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400">Wickets</div>
                <div className="text-sm font-black text-rose-400 mt-0.5">
                  {lastHawkEyeData.isLBW || Math.abs(lastHawkEyeData.impactPoint.x) < 0.13 ? 'HITTING' : 'MISSING'}
                </div>
              </div>
            </div>

            {/* Top-Down Pitch Projection SVG */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center">
              <div className="text-[11px] font-bold text-slate-400 mb-2">
                {lastHawkEyeData.deliveryName} ({lastHawkEyeData.speedKph} km/h) — {lastHawkEyeData.outcomeTitle}
              </div>
              <svg width="360" height="120" viewBox="-12 -2 24 4" className="bg-amber-950/30 rounded-xl border border-amber-500/30">
                {/* Wicket-to-Wicket Red Zone */}
                <rect x="-10.06" y="-0.15" width="20.12" height="0.30" fill="rgba(239,68,68,0.22)" />
                {/* Trajectory Polyline */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="0.12"
                  points={lastHawkEyeData.path.map((pt) => `${pt.z},${pt.x}`).join(' ')}
                />
                {/* Pitch Bounce Marker */}
                <circle cx={lastHawkEyeData.pitchPoint.z} cy={lastHawkEyeData.pitchPoint.x} r="0.22" fill="#facc15" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-slate-400">
            Bowl at least one delivery to inspect 3D Hawk-Eye ball tracking!
          </div>
        )}
      </div>
    </div>
  );
}
