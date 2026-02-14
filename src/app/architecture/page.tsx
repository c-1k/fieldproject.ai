import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbNav from "@/components/ui/BreadcrumbNav";

export const metadata: Metadata = {
  title: "Architecture — Field Project",
  description:
    "Full system architecture diagram of the Field Project: canonical pipeline, field operators, and the governed event processing flow.",
};

/* ------------------------------------------------------------------ */
/*  SVG style presets — matching ParticleBlueprint aesthetic           */
/* ------------------------------------------------------------------ */

const S = {
  stroke: "currentColor",
  strokeWidth: 0.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const D = { ...S, strokeWidth: 0.5, strokeDasharray: "3 3", opacity: 0.35 };
const T = { ...S, strokeWidth: 0.35, opacity: 0.18 };
const Label = {
  fontSize: 6,
  fontFamily: "monospace",
  fill: "currentColor",
  opacity: 0.35,
};
const LabelDim = {
  fontSize: 5,
  fontFamily: "monospace",
  fill: "currentColor",
  opacity: 0.22,
};
const LabelBright = {
  fontSize: 5.5,
  fontFamily: "monospace",
  fill: "currentColor",
  opacity: 0.55,
};

/* ------------------------------------------------------------------ */
/*  Registration crosshair                                            */
/* ------------------------------------------------------------------ */
function Reg({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x - 4} y1={y} x2={x + 4} y2={y} {...T} />
      <line x1={x} y1={y - 4} x2={x} y2={y + 4} {...T} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Small arrowhead marker def                                        */
/* ------------------------------------------------------------------ */
function ArrowDefs() {
  return (
    <defs>
      <marker
        id="arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="currentColor" strokeWidth="1" />
      </marker>
      <marker
        id="arrow-dim"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
      >
        <path d="M 0 2 L 10 5 L 0 8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </marker>
    </defs>
  );
}

/* ------------------------------------------------------------------ */
/*  Core pipeline nodes                                               */
/* ------------------------------------------------------------------ */
interface PipelineNodeProps {
  cx: number;
  cy: number;
  name: string;
  subtitle: string;
  color: string;
}

function PipelineNode({ cx, cy, name, subtitle, color }: PipelineNodeProps) {
  // Hexagon with radius 28
  const r = 28;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");

  return (
    <g>
      {/* Subtle color dot at center */}
      <circle cx={cx} cy={cy} r={3} fill={color} opacity={0.2} />
      <circle cx={cx} cy={cy} r={1} fill={color} opacity={0.35} />
      {/* Hexagon outline */}
      <polygon points={pts} {...S} fill="none" opacity={0.6} />
      {/* Inner hexagon */}
      {(() => {
        const ri = 20;
        const inner = Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          return `${cx + ri * Math.cos(a)},${cy + ri * Math.sin(a)}`;
        }).join(" ");
        return <polygon points={inner} {...S} fill="none" opacity={0.2} />;
      })()}
      {/* Name */}
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        {...LabelBright}
        fontSize={7}
        opacity={0.7}
      >
        {name}
      </text>
      {/* Subtitle below */}
      <text
        x={cx}
        y={cy + 38}
        textAnchor="middle"
        {...LabelDim}
        fontSize={4.5}
      >
        {subtitle}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Operator node (circle, smaller)                                   */
/* ------------------------------------------------------------------ */
interface OperatorNodeProps {
  cx: number;
  cy: number;
  name: string;
  subtitle: string;
  color: string;
}

function OperatorNode({ cx, cy, name, subtitle, color }: OperatorNodeProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={2} fill={color} opacity={0.2} />
      <circle cx={cx} cy={cy} r={0.8} fill={color} opacity={0.35} />
      <circle cx={cx} cy={cy} r={20} {...S} fill="none" opacity={0.45} />
      <circle cx={cx} cy={cy} r={14} {...S} fill="none" opacity={0.15} />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        {...LabelBright}
        fontSize={6.5}
        opacity={0.6}
      >
        {name}
      </text>
      <text
        x={cx}
        y={cy + 28}
        textAnchor="middle"
        {...LabelDim}
        fontSize={4}
      >
        {subtitle}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  The full architecture SVG diagram                                 */
/* ------------------------------------------------------------------ */
function ArchitectureDiagram() {
  // Core pipeline node positions (horizontal flow)
  const coreNodes = [
    { x: 100, y: 160, name: "Boson", subtitle: "Ingress &", subtitle2: "Canonicalization", color: "#3b82f6" },
    { x: 240, y: 160, name: "Fermion", subtitle: "Decisioning &", subtitle2: "Orchestration", color: "#8b5cf6" },
    { x: 380, y: 160, name: "Higgs", subtitle: "Governance", subtitle2: "Brain", color: "#f59e0b" },
    { x: 520, y: 160, name: "Hadron", subtitle: "Durability &", subtitle2: "State Machines", color: "#10b981" },
    { x: 660, y: 160, name: "Photon", subtitle: "Connectors &", subtitle2: "Egress", color: "#06b6d4" },
    { x: 800, y: 160, name: "Neutrino", subtitle: "Audit &", subtitle2: "Observability", color: "#ef4444" },
  ];

  // Operator node positions (below)
  const operatorNodes = [
    { x: 170, y: 400, name: "Quark", subtitle: "Domain Objects", color: "#a78bfa" },
    { x: 380, y: 400, name: "Gluon", subtitle: "Workflow Composition", color: "#f97316" },
    { x: 590, y: 400, name: "Graviton", subtitle: "Time & Scheduling", color: "#6366f1" },
    { x: 730, y: 400, name: "Muon", subtitle: "Sandbox Execution", color: "#94a3b8" },
  ];

  // Canonical flow connections (arrows between core nodes)
  const canonicalFlows: { from: number; to: number; label: string; curved?: boolean }[] = [
    { from: 0, to: 1, label: "Signed EventEnvelope (HMAC)" },
    { from: 1, to: 2, label: "Policy query" },
    { from: 1, to: 3, label: "Persist workflow state", curved: true },
    { from: 1, to: 4, label: "Dispatch Actions", curved: true },
    { from: 4, to: 5, label: "Emit audit records" },
    { from: 1, to: 5, label: "Decision + outcome records", curved: true },
  ];

  // Operator connections (dashed lines)
  const operatorConnections = [
    // Quark -> Boson (typing payloads)
    { opIdx: 0, coreIdx: 0, label: "typing payloads" },
    // Quark -> Fermion (typed matching)
    { opIdx: 0, coreIdx: 1, label: "typed matching" },
    // Gluon -> Fermion (workflow composition)
    { opIdx: 1, coreIdx: 1, label: "workflow composition" },
    // Gluon -> Hadron (state management)
    { opIdx: 1, coreIdx: 3, label: "state management" },
    // Graviton -> Boson (scheduled triggers)
    { opIdx: 2, coreIdx: 0, label: "scheduled triggers" },
    // Graviton -> Hadron (timer state)
    { opIdx: 2, coreIdx: 3, label: "timer state" },
    // Muon -> Photon (sandboxed execution)
    { opIdx: 3, coreIdx: 4, label: "sandboxed execution" },
  ];

  return (
    <svg
      viewBox="0 0 900 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      style={{ color: "rgba(255,255,255,0.7)" }}
    >
      <ArrowDefs />

      {/* Registration marks at corners */}
      <Reg x={16} y={16} />
      <Reg x={884} y={16} />
      <Reg x={16} y={504} />
      <Reg x={884} y={504} />

      {/* Additional registration marks at midpoints */}
      <Reg x={450} y={16} />
      <Reg x={450} y={504} />
      <Reg x={16} y={260} />
      <Reg x={884} y={260} />

      {/* ---- Section label: CANONICAL PATH ---- */}
      <text x={450} y={72} textAnchor="middle" {...Label} fontSize={8} opacity={0.25} letterSpacing="0.3em">
        CANONICAL PATH
      </text>
      {/* Underline decoration */}
      <line x1={340} y1={78} x2={560} y2={78} {...T} opacity={0.12} />

      {/* ---- Dimension line across pipeline ---- */}
      <line x1={70} y1={108} x2={830} y2={108} {...T} opacity={0.1} />
      <line x1={70} y1={105} x2={70} y2={111} {...T} opacity={0.15} />
      <line x1={830} y1={105} x2={830} y2={111} {...T} opacity={0.15} />
      <text x={450} y={104} textAnchor="middle" {...LabelDim} fontSize={4} opacity={0.15}>
        EVENT PROCESSING PIPELINE
      </text>

      {/* ---- Core pipeline nodes ---- */}
      {coreNodes.map((node) => (
        <PipelineNode
          key={node.name}
          cx={node.x}
          cy={node.y}
          name={node.name}
          subtitle={node.subtitle}
          color={node.color}
        />
      ))}

      {/* Two-line subtitles for core nodes */}
      {coreNodes.map((node) => (
        <text
          key={`sub2-${node.name}`}
          x={node.x}
          y={node.y + 44}
          textAnchor="middle"
          {...LabelDim}
          fontSize={4.5}
        >
          {node.subtitle2}
        </text>
      ))}

      {/* ---- Canonical flow arrows ---- */}
      {canonicalFlows.map((flow, i) => {
        const from = coreNodes[flow.from];
        const to = coreNodes[flow.to];
        const x1 = from.x + 28; // right edge of hexagon
        const x2 = to.x - 28; // left edge of hexagon

        if (!flow.curved) {
          // Straight arrow between adjacent nodes
          const midX = (x1 + x2) / 2;
          return (
            <g key={`flow-${i}`}>
              <line
                x1={x1}
                y1={from.y}
                x2={x2}
                y2={to.y}
                {...S}
                opacity={0.4}
                markerEnd="url(#arrow)"
              />
              {/* Label above arrow */}
              <text
                x={midX}
                y={from.y - 10}
                textAnchor="middle"
                {...LabelDim}
                fontSize={4}
              >
                {flow.label}
              </text>
            </g>
          );
        } else {
          // Curved arrow for non-adjacent connections
          const midX = (from.x + to.x) / 2;
          // Determine curve direction — these go below the pipeline
          const curveY = from.y + 55 + i * 12;
          return (
            <g key={`flow-${i}`}>
              <path
                d={`M${from.x + 20},${from.y + 24} Q${midX},${curveY} ${to.x - 20},${to.y + 24}`}
                {...S}
                opacity={0.25}
                fill="none"
                markerEnd="url(#arrow-dim)"
              />
              <text
                x={midX}
                y={curveY - 4}
                textAnchor="middle"
                {...LabelDim}
                fontSize={3.8}
              >
                {flow.label}
              </text>
            </g>
          );
        }
      })}

      {/* ---- Separator between pipeline and operators ---- */}
      <line x1={50} y1={310} x2={850} y2={310} {...D} opacity={0.15} />
      <text x={60} y={306} {...LabelDim} fontSize={4} opacity={0.15}>
        INTERFACE BOUNDARY
      </text>

      {/* ---- Section label: FIELD OPERATORS ---- */}
      <text x={450} y={340} textAnchor="middle" {...Label} fontSize={8} opacity={0.25} letterSpacing="0.3em">
        FIELD OPERATORS
      </text>
      <line x1={350} y1={346} x2={550} y2={346} {...T} opacity={0.12} />

      {/* ---- Operator nodes ---- */}
      {operatorNodes.map((node) => (
        <OperatorNode
          key={node.name}
          cx={node.x}
          cy={node.y}
          name={node.name}
          subtitle={node.subtitle}
          color={node.color}
        />
      ))}

      {/* ---- Operator dashed connections to pipeline ---- */}
      {operatorConnections.map((conn, i) => {
        const op = operatorNodes[conn.opIdx];
        const core = coreNodes[conn.coreIdx];

        // Calculate line endpoints at the edge of the shapes
        const dx = core.x - op.x;
        const dy = core.y - op.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;

        const startX = op.x + nx * 20;
        const startY = op.y + ny * 20;
        const endX = core.x - nx * 28;
        const endY = core.y - ny * 28;

        // Label position (midpoint with slight offset)
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        // Offset label perpendicular to line
        const perpX = -ny * 8;
        const perpY = nx * 8;

        return (
          <g key={`op-conn-${i}`}>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              {...D}
              opacity={0.2}
              strokeDasharray="4 4"
            />
            {/* Small dot at each end */}
            <circle cx={startX} cy={startY} r={1} fill="currentColor" opacity={0.15} />
            <circle cx={endX} cy={endY} r={1} fill="currentColor" opacity={0.15} />
            {/* Connection label */}
            <text
              x={midX + perpX}
              y={midY + perpY}
              textAnchor="middle"
              {...LabelDim}
              fontSize={3.8}
              opacity={0.18}
            >
              {conn.label}
            </text>
          </g>
        );
      })}

      {/* ---- Dimension marks (vertical, left side) ---- */}
      <line x1={38} y1={130} x2={38} y2={200} {...T} opacity={0.12} />
      <line x1={35} y1={130} x2={41} y2={130} {...T} opacity={0.15} />
      <line x1={35} y1={200} x2={41} y2={200} {...T} opacity={0.15} />
      <text
        x={30}
        y={170}
        textAnchor="middle"
        {...LabelDim}
        fontSize={4}
        opacity={0.12}
        transform="rotate(-90 30 170)"
      >
        CORE
      </text>

      <line x1={38} y1={370} x2={38} y2={440} {...T} opacity={0.12} />
      <line x1={35} y1={370} x2={41} y2={370} {...T} opacity={0.15} />
      <line x1={35} y1={440} x2={41} y2={440} {...T} opacity={0.15} />
      <text
        x={30}
        y={410}
        textAnchor="middle"
        {...LabelDim}
        fontSize={4}
        opacity={0.12}
        transform="rotate(-90 30 410)"
      >
        OPERATORS
      </text>

      {/* ---- Dimension marks (horizontal, bottom) ---- */}
      <line x1={100} y1={480} x2={800} y2={480} {...T} opacity={0.08} />
      <line x1={100} y1={477} x2={100} y2={483} {...T} opacity={0.1} />
      <line x1={800} y1={477} x2={800} y2={483} {...T} opacity={0.1} />
      <text x={450} y={490} textAnchor="middle" {...LabelDim} fontSize={3.5} opacity={0.1}>
        INGRESS TO EGRESS
      </text>

      {/* ---- Ingress/Egress annotations ---- */}
      {/* Ingress arrow entering Boson */}
      <line x1={30} y1={160} x2={68} y2={160} {...S} opacity={0.25} markerEnd="url(#arrow-dim)" />
      <text x={30} y={150} {...LabelDim} fontSize={4} opacity={0.2}>
        external
      </text>
      <text x={30} y={156} {...LabelDim} fontSize={4} opacity={0.2}>
        events
      </text>

      {/* Egress arrow exiting Neutrino */}
      <line x1={832} y1={160} x2={870} y2={160} {...S} opacity={0.25} markerEnd="url(#arrow-dim)" />
      <text x={842} y={150} {...LabelDim} fontSize={4} opacity={0.2}>
        audit
      </text>
      <text x={842} y={156} {...LabelDim} fontSize={4} opacity={0.2}>
        ledger
      </text>

      {/* ---- Graviton re-entry annotation ---- */}
      <path
        d={`M${590},${380} Q${40},${310} ${70},${165}`}
        {...D}
        opacity={0.1}
        fill="none"
        strokeDasharray="6 4"
      />
      <text x={260} y={296} {...LabelDim} fontSize={3.5} opacity={0.12}>
        time-derived events re-enter the field
      </text>

      {/* ---- Node count annotation (bottom-right) ---- */}
      <text x={860} y={484} textAnchor="end" {...LabelDim} fontSize={4} opacity={0.12}>
        6 CORE + 4 OPERATORS = 10 PARTICLES
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */
export default function ArchitecturePage() {
  return (
    <main className="min-h-screen py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <BreadcrumbNav
          items={[{ label: "Home", href: "/" }, { label: "Architecture" }]}
        />

        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight mb-4">
            System Architecture
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            The complete Field Project system — every particle, every connection,
            every boundary in a single governed view.
          </p>
        </div>

        {/* Architecture Diagram */}
        <section className="relative mb-12 sm:mb-20">
          <span className="absolute top-3 left-4 text-[10px] font-mono tracking-[0.2em] uppercase select-none text-white/20">
            FIG 0.0
          </span>
          {/* On mobile, allow horizontal scrolling for the detailed SVG */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[640px] sm:min-w-0">
              <ArchitectureDiagram />
            </div>
          </div>
          <p className="text-center text-[10px] font-mono text-white/20 mt-2 sm:hidden">
            Scroll horizontally to explore the full diagram
          </p>
        </section>

        {/* Canonical Path explanation */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-2xl font-bold font-display mb-4">
            The Canonical Path
          </h2>
          <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
            <p>
              Every event entering the Field follows the same governed
              pipeline. <strong className="text-[var(--text-primary)]">Boson</strong> accepts
              and canonicalizes external inputs into signed EventEnvelopes.{" "}
              <strong className="text-[var(--text-primary)]">Fermion</strong> evaluates
              routing rules and produces ActionPlans.{" "}
              <strong className="text-[var(--text-primary)]">Higgs</strong> enforces tenant
              policy — allow, deny, or filter — before any action executes.{" "}
              <strong className="text-[var(--text-primary)]">Hadron</strong> persists
              workflow state with idempotency guarantees.{" "}
              <strong className="text-[var(--text-primary)]">Photon</strong> dispatches
              typed connector calls to external systems.{" "}
              <strong className="text-[var(--text-primary)]">Neutrino</strong> records an
              immutable audit trail of every decision and outcome.
            </p>
            <p>
              No particle can bypass this path. No single service can override the
              governing laws. The pipeline is the structural counter-force to entropy.
            </p>
          </div>
        </section>

        {/* Field Operators explanation */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-2xl font-bold font-display mb-4">
            Field Operators
          </h2>
          <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
            <p>
              Below the canonical path, four field operators provide
              specialized capabilities that support the pipeline without replacing
              any core responsibility.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 mt-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Quark</h3>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Parses raw payloads into typed domain events — PR, Ticket, Invoice,
                  LLMRequest. Provides the shared vocabulary for pipeline matching.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Gluon</h3>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Workflow graph and DSL with fan-out, fan-in, conditional branching,
                  and compensation logic. Workflows are declared, serializable, versioned data.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Graviton</h3>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Cron triggers, delays, SLA timers, and polling schedules. All
                  time-derived events re-enter the field through the canonical path.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Muon</h3>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Safe execution of user-defined transforms within strict sandbox
                  boundaries. Resource-limited, no network access, deterministic.
                </p>
              </div>
            </div>
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
