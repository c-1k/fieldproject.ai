import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbNav from "@/components/ui/BreadcrumbNav";

export const metadata: Metadata = {
  title: "About — Field Project",
  description:
    "The philosophy behind Field Project: entropy framing, the physics metaphor, and the counter-force to architectural disorder.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <BreadcrumbNav items={[{ label: "Home", href: "/" }, { label: "About" }]} />

        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight mb-4">
            About the Field
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            The philosophy, the metaphor, and the counter-force to
            architectural disorder.
          </p>
        </div>

        {/* Elevator Definition */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold font-display mb-4">What Is Field Project?</h2>
          <div className="p-6 rounded-r-lg border-l-4 border-[var(--accent)] bg-[var(--bg-elevated)]">
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Field Project is an architecture for event-driven systems where
              every event passes through a governed pipeline of ingress,
              decisioning, policy evaluation, execution, and audit — each
              responsibility isolated in a named service modeled after a physics
              particle. The particle metaphor is not decorative: each name
              encodes what the service does and, critically, what it must never
              do, making architectural violations legible by analogy. The
              &ldquo;field&rdquo; is the processing space governed by invariant
              laws that no single service can override.
            </p>
          </div>
        </section>

        {/* The Problem */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold font-display mb-4">The Problem</h2>
          <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
            <span className="text-4xl sm:text-6xl font-display text-[var(--text-tertiary)] opacity-30 leading-none select-none">&ldquo;</span>
            <p>
              Distributed systems trend toward disorder. Services absorb
              responsibilities that belong elsewhere. Policy evaluation drifts
              into execution layers. Audit becomes optional. Configuration
              embeds itself in application code. Each shortcut is locally
              rational and globally corrosive.
            </p>
            <p>
              The result is a system where no one can answer basic questions:
              Who authorized this action? What policy was in effect? Can we
              replay this event safely? Where does tenant configuration live?
            </p>
            <p>
              This is not a tooling problem. It is an entropy problem. Without
              structural counter-force, operational complexity compounds
              silently until the system is ungovernable.
            </p>
          </div>
        </section>

        {/* The Physics Metaphor */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold font-display mb-4">
            The Physics Metaphor
          </h2>
          <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed mb-8">
            <p>
              The particle names are not decorative. They are load-bearing
              constraints. Each name encodes what the service does and —
              critically — what it must never do. When someone proposes adding
              routing logic to Boson, the physics analogy makes the violation
              immediately legible: bosons carry forces, they do not decide
              trajectories.
            </p>
            <p>
              This is a naming discipline that makes architectural violations
              visible at the level of conversation, not just code review.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
            <div className="space-y-3">
              {[
                {
                  q: "Can Neutrino reject an event?",
                  a: "Neutrinos don\u2019t interact with matter. Neutrino observes; it does not mutate.",
                },
                {
                  q: "Can Boson decide routing?",
                  a: "Bosons carry forces; they don\u2019t decide trajectories. That\u2019s Fermion\u2019s job.",
                },
                {
                  q: "Can Photon check policy?",
                  a: "Photons execute; they don\u2019t govern. Higgs governs.",
                },
                {
                  q: "Can Fermion hold durable state?",
                  a: "Fermions are stateless deciders. Hadron holds durable state.",
                },
                {
                  q: "Where does tenant config live?",
                  a: "The Higgs field gives particles their properties. Tenant config lives in Higgs.",
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className="flex gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-md bg-[var(--bg)]"
                >
                  <span className="text-[var(--accent)] font-medium shrink-0">
                    Q:
                  </span>
                  <div>
                    <span className="text-[var(--text-primary)] font-medium">
                      {item.q}
                    </span>
                    <br />
                    <span className="text-[var(--text-secondary)] text-sm">
                      {item.a}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Two Endgames */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold font-display mb-4">Two Endgames</h2>
          <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
            The Field is not a product — it is an architecture that can be
            applied to two convergent problem spaces.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-[var(--border)] border-l-4 border-l-[var(--accent)] bg-[var(--bg-elevated)]">
              <h3 className="font-semibold mb-3 text-[var(--accent)]">
                AI Governance
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Route AI requests through a governed pipeline. Policy is
                evaluated before execution. Every decision, action, and outcome
                is auditable. Tenant-level controls — rate limits, model
                allowlists, redaction rules, cost budgets — are enforced
                centrally. The field gives organizations the ability to deploy AI
                agents while maintaining control over what those agents can do
                and ensuring a complete record of what they did.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-[var(--border)] border-l-4 border-l-[var(--accent-purple)] bg-[var(--bg-elevated)]">
              <h3 className="font-semibold mb-3 text-[var(--accent-purple)]">
                Event-Driven Platform
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Build internal automation — CI/CD orchestration, incident
                response, approval workflows, webhook routing — on a governed
                event backbone. Workflows are composable, replayable, and
                auditable. The field provides the structural guarantees that make
                it safe to automate critical business processes without
                sacrificing visibility or control.
              </p>
            </div>
          </div>
        </section>

        {/* Entropy and the Field */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold font-display mb-4">
            Entropy and the Field
          </h2>
          <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
            <p>
              The second law of thermodynamics states that entropy in a closed
              system never decreases. Distributed systems are not closed, but
              they exhibit the same tendency: without active structural
              counter-force, they trend toward disorder.
            </p>
            <p>
              Every unstructured event, missing policy decision, unaudited side
              effect, or unconstrained cost dimension is entropy entering the
              system. The Field is the counter-force: canonical paths, enforced
              boundaries, immutable audit, and policy-before-execution.
            </p>
            <p>
              The field does not eliminate entropy. It structures the system so
              that entropy is visible, measurable, and contained. That is the
              most you can ask of any architecture.
            </p>
          </div>
        </section>

        {/* Explore links */}
        <section className="text-center pt-8 border-t border-[var(--border)]">
          <h2 className="text-xl sm:text-2xl font-bold font-display mb-6">Go Deeper</h2>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/particles"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]/50 transition-all font-display font-semibold text-sm sm:text-base"
            >
              The 10 Particles
            </Link>
            <Link
              href="/laws"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent-purple)]/50 transition-all font-display font-semibold text-sm sm:text-base"
            >
              The 12 Laws
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent-cyan)]/50 transition-all font-display font-semibold text-sm sm:text-base"
            >
              Back to the Field
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
