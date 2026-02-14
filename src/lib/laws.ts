export interface Law {
  number: number;
  title: string;
  statement: string;
  rationale: string;
}

export const LAWS: Law[] = [
  {
    number: 1,
    title: "Policy Before Execution",
    statement: "No side effect may be executed without prior policy evaluation. Every Action in every ActionPlan must pass through Higgs before Photon executes it.",
    rationale: "If execution can bypass policy, then governance is advisory, not enforced. An advisory governance layer will be bypassed under pressure, and the audit trail becomes unreliable.",
  },
  {
    number: 2,
    title: "Decisioning Is Separate from Execution",
    statement: "The system that decides what to do (Fermion) must be a different boundary from the system that does it (Photon). No layer may both decide and execute.",
    rationale: "When decisioning and execution are co-located, it becomes impossible to audit decisions independently of outcomes, support dry-run mode, or replay decisions without re-executing side effects.",
  },
  {
    number: 3,
    title: "Observability Must Not Mutate Outcomes",
    statement: "Neutrino (audit, observability, explainability) must never influence, block, or alter the execution of events, decisions, or actions. Neutrino is append-only and read-after-write.",
    rationale: "If the audit layer can affect outcomes, then the audit trail is not a reliable record — it is a participant whose behavior must also be audited, creating infinite regress.",
  },
  {
    number: 4,
    title: "Events Are Immutable After Canonicalization",
    statement: "Once Boson produces an EventEnvelope, the envelope's content must not be modified by any downstream layer. Layers may annotate but must not alter.",
    rationale: "If events are mutable, then replay produces different results than the original execution, audit trails are unreliable, and debugging requires knowing which layer modified what and when.",
  },
  {
    number: 5,
    title: "Side Effects Must Be Declared, Typed, and Auditable",
    statement: "Every side effect the system performs must be represented as a typed Action within an ActionPlan. No implicit, inline, or undeclared side effects are permitted.",
    rationale: "If side effects can happen outside the Action/ActionPlan model, they cannot be policy-filtered, audited, replayed, or dry-run tested. The system becomes unpredictable.",
  },
  {
    number: 6,
    title: "Replay Must Be Safe and Deterministic",
    statement: "Re-processing any EventEnvelope through the pipeline must produce the same ActionPlan (given the same policy state) and must not produce duplicate side effects.",
    rationale: "If replay is unsafe, operators cannot recover from failures, investigate incidents, or validate pipeline changes against historical traffic.",
  },
  {
    number: 7,
    title: "Tenant Isolation at Every Layer",
    statement: "No layer may allow data, configuration, credentials, or execution context from one tenant to leak into another tenant's processing.",
    rationale: "Tenant isolation failure is a security incident, not a bug. In AI governance scenarios, cross-tenant leakage means one organization's prompts, responses, or policies are exposed to another.",
  },
  {
    number: 8,
    title: "Configuration Is Externalized",
    statement: "Tenant configuration, routing overrides, policy rules, feature flags, and entitlements must live in Higgs, not in application code or hardcoded constants.",
    rationale: "Embedded configuration requires code deployment to change behavior. This makes the system slow to respond to policy changes, impossible to govern at runtime, and prone to drift.",
  },
  {
    number: 9,
    title: "Boundaries Are Explicit and Enforced",
    statement: "Communication between layers must cross a defined boundary with a typed contract. No layer may reach into another layer's data store or internal API.",
    rationale: "Implicit coupling makes it impossible to deploy, scale, or replace layers independently. It also makes boundary violations invisible.",
  },
  {
    number: 10,
    title: "Deny by Default",
    statement: "When policy, configuration, or entitlement state is missing, ambiguous, or unavailable, the system must deny. The default is always the most restrictive safe state.",
    rationale: "Fail-open systems accumulate unauthorized behavior silently. Fail-closed systems surface configuration gaps immediately and force explicit authorization.",
  },
  {
    number: 11,
    title: "Build Only the Missing Layer",
    statement: "Field exists only where other systems stop. If an existing layer can already solve the problem cleanly, Field must not duplicate it.",
    rationale: "Every new particle or capability adds surface area. The architecture earns its complexity by solving problems that no single existing tool addresses.",
  },
  {
    number: 12,
    title: "Entropy Increases by Default",
    statement: "Every unstructured event, missing policy decision, unaudited side effect, or unconstrained cost dimension is entropy entering the system. Field is the counter-force.",
    rationale: "Distributed systems trend toward disorder. Without structural counter-force — canonical paths, enforced boundaries, immutable audit, and policy-before-execution — operational entropy compounds silently.",
  },
];
