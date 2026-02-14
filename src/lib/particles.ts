export interface Particle {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  physics: string;
  role: string;
  outputs: string;
  mustNever: string;
  position: [number, number, number];
}

export const PARTICLES: Record<string, Particle> = {
  boson: {
    id: "boson",
    name: "Boson",
    subtitle: "Ingress & Canonicalization",
    color: "#3b82f6",
    physics: "Force carrier — mediates interactions between systems",
    role: "Accepts external inputs (webhooks, API calls, scheduled triggers), validates identity, wraps payloads into canonical EventEnvelopes with CorrelationId and HMAC signatures. Returns 202 immediately — never blocks on downstream processing.",
    outputs: "EventEnvelope + CorrelationId + HMAC signature",
    mustNever: "Decide routing policy, execute side effects, hold workflow state, interpret payload semantics",
    position: [-4, 0, 0],
  },
  fermion: {
    id: "fermion",
    name: "Fermion",
    subtitle: "Decisioning & Orchestration",
    color: "#8b5cf6",
    physics: "Matter particle — gives the system its structure",
    role: "Core routing engine. Evaluates pipeline rules against incoming EventEnvelopes, consults Higgs for policy evaluation, produces ActionPlans — ordered, declared lists of Actions. Dispatches to Photon for execution. Supports dry-run mode as a first-class concept.",
    outputs: "ActionPlans + execution results + decision metadata + dry-run reports",
    mustNever: "Own tenant policy, embed connector logic, act as audit ledger, hold durable workflow state",
    position: [-2, 0, 0],
  },
  higgs: {
    id: "higgs",
    name: "Higgs",
    subtitle: "Governance Brain",
    color: "#f59e0b",
    physics: "The Higgs field gives particles mass — defines observable properties",
    role: "Owns tenant configuration, evaluates policy rules: allow/deny/filter for any proposed action, connector, model, or target. Operates on allowlists by default. Provides redaction transforms and data classification.",
    outputs: "PolicyDecision (allow/deny/filter) + TenantConfig + redaction transforms",
    mustNever: "Execute side effects, store raw secrets, become a general workflow engine",
    position: [0, 0, 0],
  },
  hadron: {
    id: "hadron",
    name: "Hadron",
    subtitle: "Durability & State Machines",
    color: "#10b981",
    physics: "Composite particle — durable, structured, persistent",
    role: "Durable job store persisting workflow state across restarts. Manages step state machines (pending → dispatched → executing → succeeded/failed), retry logic with exponential backoff, dead letter queues, and persistent idempotency.",
    outputs: "Durable workflow state + job receipts + replay cursors + DLQ entries",
    mustNever: "Implement business policy, execute connectors directly, make routing decisions",
    position: [2, 0, 0],
  },
  photon: {
    id: "photon",
    name: "Photon",
    subtitle: "Connectors & Egress",
    color: "#06b6d4",
    physics: "Carries electromagnetic force to the outside world",
    role: "Typed connectors to external systems — HTTP APIs, message queues, LLM providers, SaaS platforms. Resolves credentials from vault at execution time. Classifies errors as transient, permanent, or rate-limited.",
    outputs: "ConnectorResult (success/failure + response + error classification + latency)",
    mustNever: "Decide policy or orchestration, evaluate tenant entitlements, hold workflow state",
    position: [4, 0, 0],
  },
  neutrino: {
    id: "neutrino",
    name: "Neutrino",
    subtitle: "Audit, Observability & Explainability",
    color: "#ef4444",
    physics: "Passes through matter without interacting — observes but does not change outcomes",
    role: "Append-only audit ledger recording the full processing chain for every event. Provides cost/latency accounting, decision explainability, trace views, and queryable event history.",
    outputs: "Immutable audit records + trace views + metrics + explainability reports",
    mustNever: "Influence execution outcomes, block the critical path, mutate events or decisions",
    position: [6, 0, 0],
  },
  quark: {
    id: "quark",
    name: "Quark",
    subtitle: "Domain Objects",
    color: "#a78bfa",
    physics: "Fundamental building block — typed constituents inside composite structures",
    role: "Parses raw event payloads into typed domain events (PR, Ticket, Invoice, LLMRequest). Provides shared vocabulary for pipeline matching. Purely interpretation and typing.",
    outputs: "Typed domain event models + validation results",
    mustNever: "Route, decide, or execute — purely interpretation and typing",
    position: [-1, -2, 0],
  },
  gluon: {
    id: "gluon",
    name: "Gluon",
    subtitle: "Workflow Composition",
    color: "#f97316",
    physics: "The strong force that binds quarks into hadrons — composition and binding",
    role: "Workflow graph / DSL with fan-out, fan-in, conditional branching, and compensation logic. Workflows are declared, serializable, and versioned data, not embedded code.",
    outputs: "Workflow definitions + compiled ActionPlans + compensation plans",
    mustNever: "Bypass Higgs policy — all composed actions remain policy-filtered",
    position: [1, -2, 0],
  },
  graviton: {
    id: "graviton",
    name: "Graviton",
    subtitle: "Time & Scheduling",
    color: "#6366f1",
    physics: "Mediates gravity — the force defined by spacetime",
    role: "Cron triggers, delays, SLA timers, polling schedules. All time-derived events re-enter the field through the canonical path as EventEnvelopes.",
    outputs: "Time-derived EventEnvelopes + timer state + schedule metadata",
    mustNever: "Execute side effects directly — output is always an EventEnvelope or timer state transition",
    position: [3, -2, 0],
  },
  muon: {
    id: "muon",
    name: "Muon",
    subtitle: "Sandbox Execution",
    color: "#94a3b8",
    physics: "Heavier cousin of the electron — exists briefly, does work, decays",
    role: "Safe execution of user-defined transforms and logic within strict sandbox boundaries. Resource-limited, no network access by default, deterministic execution.",
    outputs: "Deterministic transform results + sandbox execution logs + resource metrics",
    mustNever: "Allow arbitrary privileged execution, escape sandbox isolation",
    position: [5, -2, 0],
  },
} as const;

export const CORE_PARTICLES = ["boson", "fermion", "higgs", "hadron", "photon", "neutrino"] as const;
export const SUPPORTING_PARTICLES = ["quark", "gluon", "graviton", "muon"] as const;

export const CANONICAL_FLOW = [
  { from: "boson", to: "fermion", label: "Signed EventEnvelope (HMAC)" },
  { from: "fermion", to: "higgs", label: "Policy query — allowed?" },
  { from: "fermion", to: "hadron", label: "Persist workflow state" },
  { from: "fermion", to: "photon", label: "Dispatch Actions from ActionPlan" },
  { from: "photon", to: "neutrino", label: "Emit audit records" },
  { from: "fermion", to: "neutrino", label: "Decision + outcome records" },
] as const;

export const PARTICLE_LIST = Object.values(PARTICLES);
export const CORE_PARTICLE_LIST = CORE_PARTICLES.map(id => PARTICLES[id]);
export const SUPPORTING_PARTICLE_LIST = SUPPORTING_PARTICLES.map(id => PARTICLES[id]);
