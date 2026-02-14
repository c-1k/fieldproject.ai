import ParticleBlueprint from "@/components/ui/ParticleBlueprint";

interface ParticleCardProps {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  physics: string;
  role: string;
  outputs: string;
  mustNever: string;
}

export default function ParticleCard({
  id,
  name,
  subtitle,
  color,
  physics,
  role,
  outputs,
  mustNever,
}: ParticleCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)] transition-colors overflow-hidden" style={{ borderTopWidth: 3, borderTopColor: color }}>
      {/* Engineering blueprint illustration */}
      <div className="bg-[var(--bg)] border-b border-[var(--border)] px-4 pt-2 pb-0">
        <ParticleBlueprint particleId={id} className="max-w-[280px] mx-auto" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-lg border flex items-center justify-center font-mono text-sm font-bold shrink-0"
            style={{ borderColor: color, color }}
          >
            {name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-xl font-semibold font-display" style={{ color }}>
                {name}
              </h3>
              <span className="text-sm text-[var(--text-tertiary)]">
                {subtitle}
              </span>
            </div>
            <p className="text-sm text-[var(--text-tertiary)] italic mb-3">
              {physics}
            </p>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">
              {role}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 text-sm">
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
    </div>
  );
}
