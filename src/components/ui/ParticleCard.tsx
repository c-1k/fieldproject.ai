interface ParticleCardProps {
  name: string;
  subtitle: string;
  color: string;
  physics: string;
  role: string;
  outputs: string;
  mustNever: string;
}

export default function ParticleCard({
  name,
  subtitle,
  color,
  physics,
  role,
  outputs,
  mustNever,
}: ParticleCardProps) {
  return (
    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)] transition-colors">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-lg border flex items-center justify-center font-mono text-sm font-bold shrink-0"
          style={{ borderColor: color, color }}
        >
          {name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-xl font-semibold" style={{ color }}>
              {name}
            </h3>
            <span className="text-sm text-[var(--text-tertiary)]">
              {subtitle}
            </span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] italic mb-3">
            {physics}
          </p>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">
            {role}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 text-xs">
            <div className="flex-1 px-3 py-2 rounded-md bg-[var(--bg)] border border-[var(--border)]">
              <span className="text-[var(--text-tertiary)]">Outputs: </span>
              <span className="text-[var(--text-secondary)]">{outputs}</span>
            </div>
            <div className="flex-1 px-3 py-2 rounded-md bg-[var(--bg)] border border-red-500/20">
              <span className="text-red-400/70">Must never: </span>
              <span className="text-[var(--text-secondary)]">{mustNever}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
