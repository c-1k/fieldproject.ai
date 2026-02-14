"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CORE_PARTICLES, PARTICLES, CANONICAL_FLOW } from "@/lib/particles";
import { SECTIONS, SECTION_COUNT } from "@/lib/constants";
import ScrollIndicator from "@/components/ui/ScrollIndicator";

const QuantumFieldWrapper = dynamic(
  () => import("@/components/canvas/QuantumFieldWrapper"),
  { ssr: false }
);

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const p = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
      setProgress(p);
      setActiveSection(
        Math.min(Math.floor(p * SECTION_COUNT), SECTION_COUNT - 1)
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { progress, activeSection };
}

export default function Home() {
  const { progress, activeSection } = useScrollProgress();
  const activeFlowStep =
    activeSection === SECTIONS.TRAVERSAL
      ? Math.min(
          Math.floor(
            (progress * SECTION_COUNT - SECTIONS.TRAVERSAL) *
              CORE_PARTICLES.length
          ),
          CORE_PARTICLES.length - 1
        )
      : -1;

  void activeFlowStep;

  return (
    <main className="relative">
      {/* Fixed 3D background */}
      <div className="fixed inset-0 -z-10">
        <QuantumFieldWrapper scrollProgress={progress} />
      </div>

      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative min-h-screen flex items-end justify-center pb-40">
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 2.5 }}
          >
            <p className="text-sm sm:text-base tracking-[0.2em] uppercase text-[var(--text-tertiary)] font-light">
              Architecture as counter-force to entropy
            </p>
          </motion.div>
          <ScrollIndicator />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent" />
      </section>

      {/* ===== SECTION 2: THE PIPELINE ===== */}
      <section className="min-h-screen flex items-center py-24 px-6">
        <div className="max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-light text-center mb-3 tracking-tight">
              The Canonical Pipeline
            </h2>
            <p className="text-center text-[var(--text-tertiary)] mb-16 max-w-lg mx-auto text-sm leading-relaxed">
              Every event follows the same path. No step may be skipped.
              No step may absorb the responsibility of another.
            </p>

            {/* Pipeline flow */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
              {CORE_PARTICLES.map((id, i) => {
                const particle = PARTICLES[id];
                return (
                  <div key={id} className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="px-4 py-2 rounded border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] hover:border-[var(--text-tertiary)] transition-colors">
                        {particle.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-tertiary)] mt-1.5 tracking-wide">
                        {particle.subtitle}
                      </div>
                    </div>
                    {i < CORE_PARTICLES.length - 1 && (
                      <span className="text-[var(--text-tertiary)] font-mono text-sm opacity-40">
                        →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Flow details */}
            <div className="max-w-xl mx-auto space-y-1">
              {CANONICAL_FLOW.map((step) => (
                <div
                  key={`${step.from}-${step.to}`}
                  className="flex items-center gap-3 px-4 py-2 rounded text-xs backdrop-blur-sm bg-white/[0.02] border border-white/[0.03]"
                >
                  <span className="font-mono shrink-0 w-16 text-right text-[var(--text-secondary)]">
                    {PARTICLES[step.from].name}
                  </span>
                  <span className="text-[var(--text-tertiary)] opacity-40">→</span>
                  <span className="font-mono shrink-0 w-16 text-[var(--text-secondary)]">
                    {PARTICLES[step.to].name}
                  </span>
                  <span className="text-[var(--text-tertiary)]">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 3: EVENT TRAVERSAL ===== */}
      <section className="min-h-screen flex items-center py-24 px-6">
        <div className="max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-light text-center mb-3 tracking-tight">
              An Event Traverses the Field
            </h2>
            <p className="text-center text-[var(--text-tertiary)] mb-16 text-sm">
              Each particle activates in sequence.
            </p>

            <div className="space-y-0">
              {[
                {
                  step: "1",
                  particle: "boson" as const,
                  text: "External system sends a webhook. Boson validates identity, assigns CorrelationId, wraps into EventEnvelope, signs with HMAC. Returns 202.",
                },
                {
                  step: "2",
                  particle: "fermion" as const,
                  text: "Fermion verifies HMAC, invokes Quark to parse the typed domain event, then consults Higgs for policy.",
                },
                {
                  step: "3",
                  particle: "higgs" as const,
                  text: "\u201CTenant X wants to execute Action Y \u2014 allowed?\u201D Higgs evaluates and returns PolicyDecision with effective config and redaction rules.",
                },
                {
                  step: "4",
                  particle: "hadron" as const,
                  text: "Fermion builds the ActionPlan, records step state in Hadron for durability, emits decision record to Neutrino.",
                },
                {
                  step: "5",
                  particle: "photon" as const,
                  text: "For each Action in the plan: Photon resolves credentials, executes the typed connector, classifies the result.",
                },
                {
                  step: "6",
                  particle: "neutrino" as const,
                  text: "Every decision, action, and outcome is recorded in Neutrino\u2019s append-only audit ledger. Full trace available.",
                },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  className="flex gap-4 pb-6 relative"
                  initial={{ opacity: 0.3 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-[10px] font-mono shrink-0 text-[var(--text-tertiary)]">
                      {item.step}
                    </div>
                    {item.step !== "6" && (
                      <div className="w-px flex-1 bg-white/[0.04] mt-1" />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <span className="text-xs font-mono text-[var(--text-secondary)] tracking-wide">
                      {PARTICLES[item.particle].name}
                    </span>
                    <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mt-1">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 4: THE METAPHOR ===== */}
      <section className="min-h-screen flex items-center py-24 px-6">
        <div className="max-w-3xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-light text-center mb-3 tracking-tight">
              The Names Are Not Decorative
            </h2>
            <p className="text-center text-[var(--text-tertiary)] mb-16 max-w-lg mx-auto text-sm leading-relaxed">
              Each name encodes what the service does and &mdash; critically
              &mdash; what it must never do.
            </p>

            <div className="space-y-1.5">
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
                <motion.div
                  key={item.q}
                  className="flex gap-3 px-4 py-3 rounded backdrop-blur-sm bg-white/[0.02] border border-white/[0.03]"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <div>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {item.q}
                    </span>
                    <br />
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {item.a}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 5: ENTROPY ===== */}
      <section className="min-h-screen flex items-center py-24 px-6">
        <div className="max-w-3xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-light text-center mb-3 tracking-tight">
              Entropy Is the Default
            </h2>
            <p className="text-center text-[var(--text-tertiary)] mb-16 max-w-lg mx-auto text-sm leading-relaxed">
              Without a field &mdash; without canonical paths, enforced
              boundaries, and immutable audit &mdash; systems trend toward
              disorder.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-5 rounded border border-white/[0.04] backdrop-blur-sm bg-white/[0.02]">
                <h3 className="text-xs font-mono text-[var(--text-secondary)] mb-2 tracking-wide">
                  AI Governance
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                  Route AI requests through a governed pipeline. Policy is
                  evaluated before execution. Every decision, action, and outcome
                  is auditable.
                </p>
              </div>
              <div className="p-5 rounded border border-white/[0.04] backdrop-blur-sm bg-white/[0.02]">
                <h3 className="text-xs font-mono text-[var(--text-secondary)] mb-2 tracking-wide">
                  Event-Driven Platform
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                  Build internal automation &mdash; CI/CD orchestration, incident
                  response, approval workflows &mdash; on a governed event backbone.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 6: EXPLORE ===== */}
      <section className="min-h-screen flex items-center py-24 px-6">
        <div className="max-w-2xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-light mb-4 tracking-tight">
              Explore the Field
            </h2>
            <p className="text-[var(--text-tertiary)] text-sm mb-16 max-w-md mx-auto">
              The particles, the laws that govern them, and the philosophy
              behind the architecture.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <Link
                href="/particles"
                className="group p-5 rounded border border-white/[0.04] backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
              >
                <div className="text-lg font-light mb-1 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  10
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)] mb-1">Particles</div>
                <div className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
                  Every service, its physics analog, and what it must never do
                </div>
              </Link>
              <Link
                href="/laws"
                className="group p-5 rounded border border-white/[0.04] backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
              >
                <div className="text-lg font-light mb-1 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  12
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)] mb-1">Laws</div>
                <div className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
                  Non-negotiable invariants that govern the field
                </div>
              </Link>
              <Link
                href="/about"
                className="group p-5 rounded border border-white/[0.04] backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
              >
                <div className="text-lg font-light mb-1 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  &infin;
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)] mb-1">Entropy</div>
                <div className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
                  The philosophy, the metaphor, and the two endgames
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
