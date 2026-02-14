import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PARTICLES,
  CORE_PARTICLES,
  SUPPORTING_PARTICLES,
  CANONICAL_FLOW,
} from "@/lib/particles";
import ParticleBlueprint from "@/components/ui/ParticleBlueprint";
import BreadcrumbNav from "@/components/ui/BreadcrumbNav";

/* ── Static generation ── */

type PageProps = { params: Promise<{ id: string }> };

const ALL_IDS = [...CORE_PARTICLES, ...SUPPORTING_PARTICLES];

export function generateStaticParams() {
  return ALL_IDS.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const p = PARTICLES[id];
  if (!p) return {};
  return {
    title: `${p.name} — ${p.subtitle} — Field Project`,
    description: `${p.name}: ${p.role}`,
    openGraph: {
      title: `${p.name} — ${p.subtitle}`,
      description: p.role,
    },
  };
}

/* ── Helpers ── */

const FIELD_OPERATORS = new Set<string>(SUPPORTING_PARTICLES);

function getConnections(id: string) {
  const incoming = CANONICAL_FLOW.filter((f) => f.to === id);
  const outgoing = CANONICAL_FLOW.filter((f) => f.from === id);
  return { incoming, outgoing };
}

function getPrevNext(id: string) {
  const idx = ALL_IDS.indexOf(id as (typeof ALL_IDS)[number]);
  const prev = idx > 0 ? ALL_IDS[idx - 1] : null;
  const next = idx < ALL_IDS.length - 1 ? ALL_IDS[idx + 1] : null;
  return { prev, next };
}

/* ── Page ── */

export default async function ParticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const particle = PARTICLES[id];
  if (!particle) notFound();

  const { incoming, outgoing } = getConnections(particle.id);
  const { prev, next } = getPrevNext(particle.id);
  const isFieldOperator = FIELD_OPERATORS.has(particle.id);

  return (
    <main className="min-h-screen py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <BreadcrumbNav
          items={[
            { label: "Home", href: "/" },
            { label: "Particles", href: "/particles" },
            { label: particle.name },
          ]}
        />

        {/* Blueprint — full width */}
        <div className="mb-12">
          <ParticleBlueprint particleId={particle.id} />
        </div>

        {/* Name + tiny dot */}
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
            {particle.name}
          </h1>
          <span
            className="w-2 h-2 rounded-full opacity-25 shrink-0"
            style={{ backgroundColor: particle.color }}
          />
        </div>

        {/* Subtitle */}
        <p className="text-xs font-mono tracking-wide uppercase text-white/15 mb-6">
          {particle.subtitle}
        </p>

        {/* Physics metaphor */}
        <p className="text-[var(--text-tertiary)] italic mb-4 leading-relaxed">
          {particle.physics}
        </p>

        {/* Full role description */}
        <p className="text-[var(--text-secondary)] leading-relaxed mb-10 sm:mb-16">
          {particle.role}
        </p>

        {/* Outputs */}
        <section className="mb-12">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/20 mb-3">
            Outputs
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {particle.outputs}
          </p>
        </section>

        {/* Must Never */}
        <section className="mb-14 sm:mb-20">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/20 mb-3">
            Must Never
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {particle.mustNever}
          </p>
        </section>

        {/* Connection diagram */}
        <section className="mb-16 sm:mb-24">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/20 mb-6">
            Pipeline Position
          </p>

          {isFieldOperator ? (
            <p className="text-sm text-[var(--text-tertiary)] font-mono">
              Operates independently of the canonical path.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono overflow-hidden">
              {/* Incoming particles */}
              {incoming.length > 0 ? (
                incoming.map((conn, i) => (
                  <span key={`in-${i}`} className="flex items-center gap-2">
                    <Link
                      href={`/particles/${conn.from}`}
                      className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors py-1"
                    >
                      {PARTICLES[conn.from].name}
                    </Link>
                    <span className="flex items-center gap-1 text-white/10">
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="w-4 sm:w-6 h-px bg-white/10" />
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                    </span>
                  </span>
                ))
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-white/10 text-xs">ingress</span>
                  <span className="flex items-center gap-1 text-white/10">
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="w-4 sm:w-6 h-px bg-white/10" />
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                  </span>
                </span>
              )}

              {/* Current particle */}
              <span className="text-white font-semibold">
                {particle.name}
              </span>

              {/* Outgoing particles */}
              {outgoing.length > 0 ? (
                outgoing.map((conn, i) => (
                  <span key={`out-${i}`} className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-white/10">
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="w-4 sm:w-6 h-px bg-white/10" />
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                    </span>
                    <Link
                      href={`/particles/${conn.to}`}
                      className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors py-1"
                    >
                      {PARTICLES[conn.to].name}
                    </Link>
                  </span>
                ))
              ) : (
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-white/10">
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="w-4 sm:w-6 h-px bg-white/10" />
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                  </span>
                  <span className="text-white/10 text-xs">terminal</span>
                </span>
              )}
            </div>
          )}
        </section>

        {/* Prev / Next navigation */}
        <nav className="flex items-center justify-between pt-8 sm:pt-12 border-t border-white/[0.04]">
          {prev ? (
            <Link
              href={`/particles/${prev}`}
              className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors py-3 pr-4"
            >
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/20 block mb-1">
                Previous
              </span>
              {PARTICLES[prev].name}
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/particles/${next}`}
              className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors text-right py-3 pl-4"
            >
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/20 block mb-1">
                Next
              </span>
              {PARTICLES[next].name}
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </main>
  );
}
