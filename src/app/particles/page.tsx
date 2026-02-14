import type { Metadata } from "next";
import {
  PARTICLES,
  CORE_PARTICLES,
  SUPPORTING_PARTICLES,
  CORE_PARTICLE_LIST,
  SUPPORTING_PARTICLE_LIST,
} from "@/lib/particles";
import AnimatedBlueprint from "@/components/ui/AnimatedBlueprint";
import ScrollSpy from "@/components/ui/ScrollSpy";
import BreadcrumbNav from "@/components/ui/BreadcrumbNav";

export const metadata: Metadata = {
  title: "Particles — Field Project",
  description:
    "The 10 particles of the Field Project architecture: Boson, Fermion, Higgs, Hadron, Photon, Neutrino, Quark, Gluon, Graviton, and Muon.",
};

export default function ParticlesPage() {
  const allParticleIds = [...CORE_PARTICLES, ...SUPPORTING_PARTICLES];

  // Split core into pairs for alternating wide/pair layout
  const wide1 = CORE_PARTICLE_LIST[0]; // Boson
  const pair1 = [CORE_PARTICLE_LIST[1], CORE_PARTICLE_LIST[2]]; // Fermion, Higgs
  const wide2 = CORE_PARTICLE_LIST[3]; // Hadron
  const pair2 = [CORE_PARTICLE_LIST[4], CORE_PARTICLE_LIST[5]]; // Photon, Neutrino

  const scrollSpyParticles = allParticleIds.map((id) => ({
    id,
    name: PARTICLES[id].name,
    color: PARTICLES[id].color,
  }));

  return (
    <main className="min-h-screen py-16 sm:py-24 px-4 sm:px-6">
      <ScrollSpy particles={scrollSpyParticles} />
      <div className="max-w-6xl mx-auto">
        <BreadcrumbNav items={[{ label: "Home", href: "/" }, { label: "Particles" }]} />

        {/* Header */}
        <div className="text-center mb-12 sm:mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold font-display tracking-tight mb-4">
            The 10 Particles
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Every service in the Field is modeled after a physics particle. The
            name encodes what it does — and what it must never do.
          </p>
        </div>

        {/* Compact nav */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-1 mb-16 sm:mb-24">
          {allParticleIds.map((id) => {
            const p = PARTICLES[id];
            return (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors py-2 sm:py-0"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full opacity-40"
                  style={{ backgroundColor: p.color }}
                />
                {p.name}
              </a>
            );
          })}
        </nav>

        {/* ── CORE PIPELINE ── */}
        <section className="mb-24 sm:mb-40">
          {/* Section label — large, clear differentiation */}
          <div className="mb-12 sm:mb-20">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/25">
                I — The Canonical Pipeline
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-white/[0.06] to-transparent" />
            </div>
            <p className="text-center text-sm text-[var(--text-tertiary)] max-w-lg mx-auto">
              Six particles in strict order. Every event traverses this path — no step may be skipped.
            </p>
            {/* Inline flow */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-mono text-white/15 mt-4">
              {CORE_PARTICLES.map((id, i) => (
                <span key={id} className="flex items-center gap-2">
                  <span>{PARTICLES[id].name}</span>
                  {i < CORE_PARTICLES.length - 1 && <span>→</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Wide: Boson — drawing left, text right */}
          <div id={wide1.id} className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center mb-16 sm:mb-24">
            <AnimatedBlueprint particleId={wide1.id} />
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-2xl font-semibold font-display text-[var(--text-primary)]">{wide1.name}</h3>
                <span className="w-1.5 h-1.5 rounded-full opacity-25 shrink-0" style={{ backgroundColor: wide1.color }} />
              </div>
              <p className="text-xs font-mono tracking-wide uppercase text-white/15 mb-4">{wide1.subtitle}</p>
              <p className="text-sm text-[var(--text-tertiary)] italic mb-3 leading-relaxed">{wide1.physics}</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{wide1.role}</p>
            </div>
          </div>

          {/* Pair: Fermion + Higgs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 mb-16 sm:mb-24">
            {pair1.map((p) => (
              <div key={p.id} id={p.id} className="scroll-mt-24">
                <AnimatedBlueprint particleId={p.id} className="mb-6" />
                <div className="flex items-center gap-2.5 mb-1">
                  <h3 className="text-xl font-semibold font-display text-[var(--text-primary)]">{p.name}</h3>
                  <span className="w-1.5 h-1.5 rounded-full opacity-25 shrink-0" style={{ backgroundColor: p.color }} />
                </div>
                <p className="text-xs font-mono tracking-wide uppercase text-white/15 mb-4">{p.subtitle}</p>
                <p className="text-sm text-[var(--text-tertiary)] italic mb-3 leading-relaxed">{p.physics}</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{p.role}</p>
              </div>
            ))}
          </div>

          {/* Wide: Hadron — text left, drawing right (reversed) */}
          <div id={wide2.id} className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center mb-16 sm:mb-24">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-2xl font-semibold font-display text-[var(--text-primary)]">{wide2.name}</h3>
                <span className="w-1.5 h-1.5 rounded-full opacity-25 shrink-0" style={{ backgroundColor: wide2.color }} />
              </div>
              <p className="text-xs font-mono tracking-wide uppercase text-white/15 mb-4">{wide2.subtitle}</p>
              <p className="text-sm text-[var(--text-tertiary)] italic mb-3 leading-relaxed">{wide2.physics}</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{wide2.role}</p>
            </div>
            <div className="order-1 lg:order-2">
              <AnimatedBlueprint particleId={wide2.id} />
            </div>
          </div>

          {/* Pair: Photon + Neutrino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
            {pair2.map((p) => (
              <div key={p.id} id={p.id} className="scroll-mt-24">
                <AnimatedBlueprint particleId={p.id} className="mb-6" />
                <div className="flex items-center gap-2.5 mb-1">
                  <h3 className="text-xl font-semibold font-display text-[var(--text-primary)]">{p.name}</h3>
                  <span className="w-1.5 h-1.5 rounded-full opacity-25 shrink-0" style={{ backgroundColor: p.color }} />
                </div>
                <p className="text-xs font-mono tracking-wide uppercase text-white/15 mb-4">{p.subtitle}</p>
                <p className="text-sm text-[var(--text-tertiary)] italic mb-3 leading-relaxed">{p.physics}</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{p.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FIELD OPERATORS ── */}
        <section className="mb-20 sm:mb-28">
          {/* Section label — visually distinct from core */}
          <div className="mb-12 sm:mb-20">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.04] to-transparent" />
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/15">
                II — Field Operators
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-white/[0.04] to-transparent" />
            </div>
            <p className="text-center text-sm text-[var(--text-tertiary)] max-w-lg mx-auto">
              Four specialized operators that act on events without entering the canonical path.
              They type, compose, schedule, and sandbox.
            </p>
          </div>

          {/* 2x2 offset grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 sm:gap-x-16 gap-y-0">
            {SUPPORTING_PARTICLE_LIST.map((p, i) => (
              <div
                key={p.id}
                id={p.id}
                className={`scroll-mt-24 mb-20 ${i % 2 === 1 ? "sm:mt-10" : ""}`}
              >
                <AnimatedBlueprint particleId={p.id} className="mb-5" />
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold font-display text-[var(--text-primary)]">{p.name}</h3>
                  <span className="w-1.5 h-1.5 rounded-full opacity-25 shrink-0" style={{ backgroundColor: p.color }} />
                </div>
                <p className="text-[10px] font-mono tracking-wide uppercase text-white/15 mb-3">{p.subtitle}</p>
                <p className="text-xs text-[var(--text-tertiary)] italic mb-2 leading-relaxed">{p.physics}</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{p.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Back link */}
        <div className="text-center">
          <a
            href="/"
            className="inline-block py-3 px-4 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            ← Back to the Field
          </a>
        </div>
      </div>
    </main>
  );
}
