import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-tertiary)] mb-6">
          Observation failed
        </p>

        <h1 className="text-8xl sm:text-9xl font-bold font-display tracking-tighter text-[var(--text-primary)]">
          404
        </h1>

        <p className="text-lg sm:text-xl text-[var(--text-secondary)] mt-4 font-light">
          This particle hasn&apos;t been discovered yet.
        </p>

        <p className="text-sm text-[var(--text-tertiary)] mt-2 max-w-md mx-auto leading-relaxed">
          The path you followed decayed before reaching the detector.
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded border border-white/[0.08] backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.06] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            <span className="font-mono text-xs text-[var(--text-tertiary)]">&larr;</span>
            Return to the field
          </Link>
        </div>
      </div>
    </main>
  );
}
