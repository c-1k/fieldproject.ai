import type { Metadata } from "next";
import Link from "next/link";
import {
  PARTICLES,
  CORE_PARTICLES,
  CORE_PARTICLE_LIST,
  SUPPORTING_PARTICLE_LIST,
  CANONICAL_FLOW,
} from "@/lib/particles";
import AnimatedBlueprint from "@/components/ui/AnimatedBlueprint";
import BreadcrumbNav from "@/components/ui/BreadcrumbNav";

export const metadata: Metadata = {
  title: "Architecture — Field Project",
  description:
    "Full system architecture of the Field Project: canonical pipeline, field operators, connection index, and the governed event processing flow.",
};

/* ------------------------------------------------------------------ */
/*  Flow connector — vertical arrow between pipeline stages            */
/* ------------------------------------------------------------------ */
function FlowConnector({
  label,
  sublabel,
}: {
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="flex flex-col items-center py-5 sm:py-8">
      <div className="w-px h-5 bg-gradient-to-b from-white/[0.04] to-white/[0.08]" />
      <div className="py-2.5 px-4 sm:px-6 text-center">
        <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.12em] text-white/20 block">
          {label}
        </span>
        {sublabel && (
          <span className="text-[9px] font-mono text-white/10 block mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
      <svg width="10" height="16" className="text-white/12">
        <path
          d="M5,0 L5,11 M2,8 L5,14 L8,8"
          stroke="currentColor"
          strokeWidth="0.75"
          fill="none"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Architectural annotation block (receives / outputs / constraint)   */
/* ------------------------------------------------------------------ */
function ArchAnnotation({
  receives,
  outputs,
  detail,
  constraint,
}: {
  receives: string;
  outputs: string;
  detail?: string;
  constraint: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/15 block mb-1">
          Receives
        </span>
        <p className="text-[var(--text-secondary)] font-mono text-xs leading-relaxed">
          {receives}
        </p>
      </div>
      <div>
        <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/15 block mb-1">
          Outputs
        </span>
        <p className="text-[var(--text-secondary)] font-mono text-xs leading-relaxed">
          {outputs}
        </p>
      </div>
      {detail && (
        <p className="text-[var(--text-tertiary)] text-xs leading-relaxed italic">
          {detail}
        </p>
      )}
      <div>
        <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/10 block mb-1">
          Must Never
        </span>
        <p className="text-white/15 font-mono text-[10px] leading-relaxed">
          {constraint}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function ArchitecturePage() {
  const wide1 = CORE_PARTICLE_LIST[0]; // Boson
  const pair1 = [CORE_PARTICLE_LIST[1], CORE_PARTICLE_LIST[2]]; // Fermion, Higgs
  const wide2 = CORE_PARTICLE_LIST[3]; // Hadron
  const pair2 = [CORE_PARTICLE_LIST[4], CORE_PARTICLE_LIST[5]]; // Photon, Neutrino

  const operatorConnections: Record<
    string,
    { target: string; label: string }[]
  > = {
    quark: [
      { target: "Boson", label: "typing payloads" },
      { target: "Fermion", label: "typed matching" },
    ],
    gluon: [
      { target: "Fermion", label: "workflow composition" },
      { target: "Hadron", label: "state management" },
    ],
    graviton: [
      { target: "Boson", label: "scheduled triggers" },
      { target: "Hadron", label: "timer state" },
    ],
    muon: [{ target: "Photon", label: "sandboxed execution" }],
  };

  return (
    <main className="min-h-screen py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <BreadcrumbNav
          items={[{ label: "Home", href: "/" }, { label: "Architecture" }]}
        />

        {/* Header */}
        <div className="text-center mb-12 sm:mb-20">
          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight mb-4">
            System Architecture
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            The complete Field Project system — every particle, every connection,
            every boundary in a single governed view.
          </p>
        </div>

        {/* ── SECTION I — CANONICAL PIPELINE ── */}
        <section className="mb-24 sm:mb-40">
          <div className="mb-12 sm:mb-20">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/25">
                I — The Canonical Pipeline
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-white/[0.06] to-transparent" />
            </div>
            <p className="text-center text-sm text-[var(--text-tertiary)] max-w-lg mx-auto">
              Every event traverses this path. No step may be skipped, no
              particle may be bypassed.
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

          {/* ── Boson (wide: blueprint left, annotation right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start mb-2">
            <AnimatedBlueprint particleId={wide1.id} />
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-2xl font-semibold font-display text-[var(--text-primary)]">
                  {wide1.name}
                </h3>
                <span
                  className="w-2 h-2 rounded-full opacity-25 shrink-0"
                  style={{ backgroundColor: wide1.color }}
                />
              </div>
              <p className="text-xs font-mono tracking-wide uppercase text-white/15 mb-5">
                {wide1.subtitle}
              </p>
              <ArchAnnotation
                receives="External events (webhook · API · cron)"
                outputs="Signed EventEnvelope (HMAC + CorrelationId)"
                detail="Returns 202 immediately — never blocks on downstream processing."
                constraint="Decide routing policy, execute side effects, hold workflow state"
              />
            </div>
          </div>

          <FlowConnector label="EventEnvelope + CorrelationId + HMAC" />

          {/* ── Fermion + Higgs (pair) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 mb-2">
            {/* Fermion */}
            <div>
              <AnimatedBlueprint particleId={pair1[0].id} className="mb-6" />
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-xl font-semibold font-display text-[var(--text-primary)]">
                  {pair1[0].name}
                </h3>
                <span
                  className="w-1.5 h-1.5 rounded-full opacity-25 shrink-0"
                  style={{ backgroundColor: pair1[0].color }}
                />
              </div>
              <p className="text-xs font-mono tracking-wide uppercase text-white/15 mb-5">
                {pair1[0].subtitle}
              </p>
              <ArchAnnotation
                receives="EventEnvelope from Boson"
                outputs="ActionPlan (ordered[]) → Photon · state → Hadron · records → Neutrino"
                detail="Consults Higgs for policy evaluation. Supports dry-run as a first-class concept."
                constraint="Own tenant policy, embed connector logic, hold durable workflow state"
              />
            </div>
            {/* Higgs */}
            <div>
              <AnimatedBlueprint particleId={pair1[1].id} className="mb-6" />
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-xl font-semibold font-display text-[var(--text-primary)]">
                  {pair1[1].name}
                </h3>
                <span
                  className="w-1.5 h-1.5 rounded-full opacity-25 shrink-0"
                  style={{ backgroundColor: pair1[1].color }}
                />
              </div>
              <p className="text-xs font-mono tracking-wide uppercase text-white/15 mb-5">
                {pair1[1].subtitle}
              </p>
              <ArchAnnotation
                receives="Policy query from Fermion"
                outputs="PolicyDecision (allow | deny | filter) + redaction transforms"
                detail="5 governance layers: tenant config → allowlist → policy engine → redaction → classification."
                constraint="Execute side effects, store raw secrets, become a workflow engine"
              />
            </div>
          </div>

          {/* Fermion ↔ Higgs consultation badge */}
          <div className="flex items-center justify-center py-2 mb-2">
            <span className="text-[9px] font-mono tracking-[0.1em] text-white/12 border border-white/[0.04] rounded px-2.5 py-1">
              Fermion ←→ Higgs : policy query · allow | deny | filter
            </span>
          </div>

          <FlowConnector
            label="ActionPlan (ordered[]) + PolicyDecision"
            sublabel="Fermion dispatches to Hadron, Photon, Neutrino"
          />

          {/* ── Hadron (wide reversed: annotation left, blueprint right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start mb-2">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-2xl font-semibold font-display text-[var(--text-primary)]">
                  {wide2.name}
                </h3>
                <span
                  className="w-2 h-2 rounded-full opacity-25 shrink-0"
                  style={{ backgroundColor: wide2.color }}
                />
              </div>
              <p className="text-xs font-mono tracking-wide uppercase text-white/15 mb-5">
                {wide2.subtitle}
              </p>
              <ArchAnnotation
                receives="Workflow state from Fermion"
                outputs="Durable state + job receipts + replay cursors + DLQ entries"
                detail="State machine: pending → dispatched → executing → succeeded/failed. Exponential backoff retry."
                constraint="Implement business policy, execute connectors, make routing decisions"
              />
            </div>
            <div className="order-1 lg:order-2">
              <AnimatedBlueprint particleId={wide2.id} />
            </div>
          </div>

          <FlowConnector
            label="Persisted state + idempotency guarantee"
            sublabel="Actions dispatched through Photon"
          />

          {/* ── Photon + Neutrino (pair) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
            {/* Photon */}
            <div>
              <AnimatedBlueprint particleId={pair2[0].id} className="mb-6" />
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-xl font-semibold font-display text-[var(--text-primary)]">
                  {pair2[0].name}
                </h3>
                <span
                  className="w-1.5 h-1.5 rounded-full opacity-25 shrink-0"
                  style={{ backgroundColor: pair2[0].color }}
                />
              </div>
              <p className="text-xs font-mono tracking-wide uppercase text-white/15 mb-5">
                {pair2[0].subtitle}
              </p>
              <ArchAnnotation
                receives="Action dispatch from Fermion"
                outputs="ConnectorResult (success | failure + error classification + latency)"
                detail="5 connector types: HTTP/REST · gRPC · LLM Provider · Message Queue · SaaS Platform."
                constraint="Decide policy, evaluate tenant entitlements, hold workflow state"
              />
            </div>
            {/* Neutrino */}
            <div>
              <AnimatedBlueprint particleId={pair2[1].id} className="mb-6" />
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-xl font-semibold font-display text-[var(--text-primary)]">
                  {pair2[1].name}
                </h3>
                <span
                  className="w-1.5 h-1.5 rounded-full opacity-25 shrink-0"
                  style={{ backgroundColor: pair2[1].color }}
                />
              </div>
              <p className="text-xs font-mono tracking-wide uppercase text-white/15 mb-5">
                {pair2[1].subtitle}
              </p>
              <ArchAnnotation
                receives="Audit records from Photon + decision records from Fermion"
                outputs="Immutable audit ledger + trace views + cost/latency metrics"
                detail="Append-only. Observes but never modifies — events pass through unchanged."
                constraint="Influence execution outcomes, block the critical path, mutate events"
              />
            </div>
          </div>

          {/* Photon → Neutrino flow badge */}
          <div className="flex items-center justify-center pt-4">
            <span className="text-[9px] font-mono tracking-[0.1em] text-white/12 border border-white/[0.04] rounded px-2.5 py-1">
              Photon → Neutrino : audit records · ConnectorResult + latency +
              cost
            </span>
          </div>
        </section>

        {/* ── SECTION II — FIELD OPERATORS ── */}
        <section className="mb-20 sm:mb-28">
          <div className="mb-12 sm:mb-20">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.04] to-transparent" />
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/15">
                II — Field Operators
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-white/[0.04] to-transparent" />
            </div>
            <p className="text-center text-sm text-[var(--text-tertiary)] max-w-lg mx-auto">
              Four specialized operators that act on events without entering the
              canonical path. They type, compose, schedule, and sandbox.
            </p>
          </div>

          {/* 2×2 offset grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 sm:gap-x-16 gap-y-0">
            {SUPPORTING_PARTICLE_LIST.map((p, i) => {
              const connections = operatorConnections[p.id] || [];
              return (
                <div
                  key={p.id}
                  className={`mb-20 ${i % 2 === 1 ? "sm:mt-10" : ""}`}
                >
                  <AnimatedBlueprint particleId={p.id} className="mb-5" />
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold font-display text-[var(--text-primary)]">
                      {p.name}
                    </h3>
                    <span
                      className="w-1.5 h-1.5 rounded-full opacity-25 shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                  </div>
                  <p className="text-[10px] font-mono tracking-wide uppercase text-white/15 mb-3">
                    {p.subtitle}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                    {p.role}
                  </p>
                  {/* Connection badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {connections.map((conn) => (
                      <span
                        key={conn.target}
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/20 border border-white/[0.06] rounded px-2 py-0.5"
                      >
                        → {conn.target}
                        <span className="text-white/10">({conn.label})</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION III — CONNECTION INDEX ── */}
        <section className="mb-16 sm:mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.04] to-transparent" />
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/12">
              III — Connection Index
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-white/[0.04] to-transparent" />
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Canonical flows */}
            <div className="space-y-2 mb-6">
              {CANONICAL_FLOW.map((flow, i) => (
                <div
                  key={i}
                  className="flex items-baseline gap-2 text-[11px] font-mono"
                >
                  <span className="text-white/20">
                    {PARTICLES[flow.from].name}
                  </span>
                  <span className="text-white/8">→</span>
                  <span className="text-white/20">
                    {PARTICLES[flow.to].name}
                  </span>
                  <span className="text-white/10 ml-1">{flow.label}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-white/[0.03] mb-6" />

            {/* Operator connections */}
            <div className="space-y-2">
              {SUPPORTING_PARTICLE_LIST.map((p) => {
                const connections = operatorConnections[p.id] || [];
                return (
                  <div
                    key={p.id}
                    className="flex items-baseline gap-2 text-[11px] font-mono"
                  >
                    <span className="text-white/20">{p.name}</span>
                    <span className="text-white/8">→</span>
                    <span className="text-white/15">
                      {connections.map((c) => c.target).join(", ")}
                    </span>
                    <span className="text-white/10 ml-1">
                      {connections.map((c) => c.label).join(" · ")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Particle count */}
            <p className="text-[10px] font-mono text-white/8 text-center mt-8">
              6 CORE + 4 OPERATORS = 10 PARTICLES
            </p>
          </div>
        </section>

        {/* Explore links */}
        <section className="text-center pt-8 border-t border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/particles"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]/50 transition-all font-display font-semibold text-center"
            >
              The 10 Particles
            </Link>
            <Link
              href="/laws"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent-purple)]/50 transition-all font-display font-semibold text-center"
            >
              The 12 Laws
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent-cyan)]/50 transition-all font-display font-semibold text-center"
            >
              Back to the Field
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
