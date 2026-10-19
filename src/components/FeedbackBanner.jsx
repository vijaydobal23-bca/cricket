// ============================================================================
// CENTER-TOP FEEDBACK TOAST & TIMING BANNER
// ============================================================================

export default function FeedbackBanner({ gameScreen, feedbackBanner }) {
  if (gameScreen !== 'PLAYING' || !feedbackBanner?.visible) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center">
      <div
        className={`px-6 py-2.5 rounded-2xl border backdrop-blur-md shadow-2xl text-center transition-all duration-300 ${
          feedbackBanner.type === 'wicket'
            ? 'bg-rose-950/90 border-rose-500 text-rose-100'
            : feedbackBanner.type === 'boundary'
            ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100'
            : feedbackBanner.type === 'warning'
            ? 'bg-amber-950/90 border-amber-400 text-amber-100'
            : 'bg-slate-900/85 border-cyan-500/60 text-white'
        }`}
      >
        <div className="text-base sm:text-xl font-black tracking-wide uppercase">
          {feedbackBanner.title}
        </div>
        <div className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
          {feedbackBanner.subtitle}
        </div>
      </div>
    </div>
  );
}
