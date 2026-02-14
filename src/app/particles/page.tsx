import type { Metadata } from "next";
import {
  PARTICLES,
  CORE_PARTICLES,
  SUPPORTING_PARTICLES,
  CANONICAL_FLOW,
  CORE_PARTICLE_LIST,
  SUPPORTING_PARTICLE_LIST,
} from "@/lib/particles";
import ParticleCard from "@/components/ui/ParticleCard";
import BreadcrumbNav from "@/components/ui/BreadcrumbNav";

export const metadata: Metadata = {
  title: "Particles — Field Project",
  description:
    "The 10 particles of the Field Project architecture: Boson, Fermion, Higgs, Hadron, Photon, Neutrino, Quark, Gluon, Graviton, and Muon.",
};

export default function ParticlesPage() {
  const allParticleIds = [...CORE_PARTICLES, ...SUPPORTING_PARTICLES];

  return (
    <main className="min-h-screen py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <BreadcrumbNav items={[{ label: "Home", href: "/" }, { label: "Particles" }]} />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            The 10 Particles
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Every service in the Field is modeled after a physics particle. The
            name encodes what it does — and what it must never do.
          </p>
        </div>

        {/* Particle selector bar */}
        <nav className="flex flex-wrap items-center justify-center gap-2 mb-16">
          {allParticleIds.map((id) => {
            const p = PARTICLES[id];
            return (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)] transition-colors text-sm"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-[var(--text-secondary)]">{p.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Canonical flow diagram */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-3">
            Canonical Flow
          </h2>
          <p className="text-center text-[var(--text-secondary)] mb-8 text-sm">
            Every event follows this path. No step may be skipped.
          </p>

          {/* Pipeline visualization */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {CORE_PARTICLES.map((id, i) => {
              const particle = PARTICLES[id];
              return (
                <div key={id} className="flex items-center gap-3">
                  <a href={`#${id}`} className="text-center group">
                    <div
                      className="px-4 py-2.5 rounded-lg border text-sm font-medium transition-all group-hover:bg-[var(--bg-elevated)]"
                      style={{
                        borderColor: particle.color,
                        color: particle.color,
                      }}
                    >
                      {particle.name}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">
                      {particle.subtitle}
                    </div>
                  </a>
                  {i < CORE_PARTICLES.length - 1 && (
                    <span className="text-[var(--text-tertiary)] font-mono text-lg">
                      →
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Flow detail rows */}
          <div className="max-w-2xl mx-auto space-y-2">
            {CANONICAL_FLOW.map((step) => (
              <div
                key={`${step.from}-${step.to}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-md bg-[var(--bg-surface)] text-sm"
              >
                <span
                  className="font-mono shrink-0 w-20 text-right"
                  style={{ color: PARTICLES[step.from].color }}
                >
                  {PARTICLES[step.from].name}
                </span>
                <span className="text-[var(--text-tertiary)]">→</span>
                <span
                  className="font-mono shrink-0 w-20"
                  style={{ color: PARTICLES[step.to].color }}
                >
                  {PARTICLES[step.to].name}
                </span>
                <span className="text-[var(--text-secondary)]">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Core particles (6 expanded cards) */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-2">Core Particles</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8">
            The 6 particles in the canonical pipeline — every event passes
            through them in order.
          </p>

          <div className="space-y-4">
            {CORE_PARTICLE_LIST.map((p) => (
              <div key={p.id} id={p.id} className="scroll-mt-24">
                <ParticleCard
                  name={p.name}
                  subtitle={p.subtitle}
                  color={p.color}
                  physics={p.physics}
                  role={p.role}
                  outputs={p.outputs}
                  mustNever={p.mustNever}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Supporting particles (4 in 2-col grid) */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-2">Supporting Particles</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8">
            Specialized services that extend the pipeline without violating its
            boundaries.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {SUPPORTING_PARTICLE_LIST.map((p) => (
              <div key={p.id} id={p.id} className="scroll-mt-24">
                <ParticleCard
                  name={p.name}
                  subtitle={p.subtitle}
                  color={p.color}
                  physics={p.physics}
                  role={p.role}
                  outputs={p.outputs}
                  mustNever={p.mustNever}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Back link */}
        <div className="text-center">
          <a
            href="/"
            className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            ← Back to the Field
          </a>
        </div>
      </div>
    </main>
  );
}
