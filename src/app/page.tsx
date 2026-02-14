"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CORE_PARTICLES, PARTICLES } from "@/lib/particles";
import { SECTION_COUNT } from "@/lib/constants";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import ParticleBlueprint from "@/components/ui/ParticleBlueprint";

const QuantumFieldWrapper = dynamic(
  () => import("@/components/canvas/QuantumFieldWrapper"),
  { ssr: false }
);

function useActiveSection() {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const p = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
      const next = Math.min(Math.floor(p * SECTION_COUNT), SECTION_COUNT - 1);
      setActiveSection((prev) => (prev !== next ? next : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return activeSection;
}

export default function Home() {
  const activeSection = useActiveSection();

  return (
    <main className="relative">
      {/* Fixed 3D background — fades to subtle atmosphere past hero */}
      <div
        className="fixed inset-0 -z-10 transition-opacity duration-700"
        style={{ opacity: activeSection === 0 ? 1 : 0.25 }}
      >
        <QuantumFieldWrapper />
      </div>

      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Title + subtitles — centered in the black hole */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 2.0 }}
          >
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter font-display mb-4">
              Field Project
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 2.8 }}
          >
            <p className="text-sm sm:text-base tracking-[0.2em] uppercase text-[var(--text-tertiary)] font-light">
              Architecture as counter-force to entropy
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 3.4 }}
          >
            <p className="text-sm text-[var(--text-tertiary)] mt-4">
              10 particles. 12 laws. One canonical path.
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator — pinned to bottom */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 4.0 }}
        >
          <ScrollIndicator />
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent" />
      </section>

      {/* Section divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      {/* ===== SECTION 2: THE PIPELINE ===== */}
      <section className="min-h-screen flex items-center py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-center mb-3 tracking-tight">
              The Canonical Pipeline
            </h2>
            <p className="text-center text-[var(--text-tertiary)] mb-16 max-w-lg mx-auto text-sm leading-relaxed">
              Every event follows the same path. No step may be skipped.
              No step may absorb the responsibility of another.
            </p>

            {/* Compact horizontal flow */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mb-16 px-2 overflow-hidden">
              {CORE_PARTICLES.map((id, i) => (
                <div key={id} className="flex items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm font-mono text-white whitespace-nowrap">
                    {PARTICLES[id].name}
                  </span>
                  {i < CORE_PARTICLES.length - 1 && (
                    <span className="text-white/10 font-mono text-xs sm:text-sm">→</span>
                  )}
                </div>
              ))}
            </div>

            {/* Blueprint grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {CORE_PARTICLES.map((id, i) => {
                const particle = PARTICLES[id];
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                  >
                    <ParticleBlueprint particleId={id} className="mb-3" />
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-1.5 h-1.5 rounded-full opacity-25"
                        style={{ backgroundColor: particle.color }}
                      />
                      <Link
                        href={`/particles/${id}`}
                        className="text-base sm:text-lg font-semibold font-display text-white hover:text-white/80 transition-colors py-1 inline-flex items-center min-h-[44px]"
                      >
                        {particle.name}
                      </Link>
                    </div>
                    <p className="text-[10px] font-mono uppercase text-white/15 tracking-wider">
                      {particle.subtitle}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      {/* ===== SECTION 3: EVENT TRAVERSAL ===== */}
      <section className="min-h-screen flex items-center py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-center mb-3 tracking-tight">
              An Event Traverses the Field
            </h2>
            <p className="text-center text-[var(--text-tertiary)] mb-16 text-sm">
              Each particle activates in sequence.
            </p>

            <div className="relative ml-4">
              {/* Vertical timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.06]" />

              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    particle: "boson" as const,
                    text: "External system sends a webhook. Boson validates identity, assigns CorrelationId, wraps into EventEnvelope, signs with HMAC. Returns 202.",
                  },
                  {
                    step: "02",
                    particle: "fermion" as const,
                    text: "Fermion verifies HMAC, invokes Quark to parse the typed domain event, then consults Higgs for policy.",
                  },
                  {
                    step: "03",
                    particle: "higgs" as const,
                    text: "\u201CTenant X wants to execute Action Y \u2014 allowed?\u201D Higgs evaluates and returns PolicyDecision with effective config and redaction rules.",
                  },
                  {
                    step: "04",
                    particle: "hadron" as const,
                    text: "Fermion builds the ActionPlan, records step state in Hadron for durability, emits decision record to Neutrino.",
                  },
                  {
                    step: "05",
                    particle: "photon" as const,
                    text: "For each Action in the plan: Photon resolves credentials, executes the typed connector, classifies the result.",
                  },
                  {
                    step: "06",
                    particle: "neutrino" as const,
                    text: "Every decision, action, and outcome is recorded in Neutrino\u2019s append-only audit ledger. Full trace available.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    className="relative pl-8"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20%" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-0 top-1.5 w-2 h-2 rounded-full -translate-x-[3.5px]"
                      style={{
                        backgroundColor: PARTICLES[item.particle].color,
                        opacity: 0.25,
                      }}
                    />

                    <span className="text-[10px] font-mono text-white/20">
                      {item.step}
                    </span>
                    <h3 className="font-display font-semibold text-white mt-0.5">
                      {PARTICLES[item.particle].name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-1">
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      {/* ===== SECTION 4: THE METAPHOR ===== */}
      <section className="min-h-screen flex items-center py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-center mb-3 tracking-tight">
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
              ].map((item, i) => (
                <motion.div
                  key={item.q}
                  className={`flex gap-3 px-3 sm:px-4 py-3 rounded backdrop-blur-sm bg-white/[0.02] border border-white/[0.03] max-w-xl ${i % 2 === 0 ? "sm:ml-0 sm:mr-auto" : "sm:ml-auto sm:mr-0"}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <div>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {item.q}
                    </span>
                    <br />
                    <span className="text-sm text-[var(--text-tertiary)]">
                      {item.a}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      {/* ===== SECTION 5: ENTROPY ===== */}
      <section className="min-h-screen flex items-center py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-center mb-3 tracking-tight">
              Entropy Is the Default
            </h2>
            <p className="text-center text-[var(--text-tertiary)] mb-16 max-w-lg mx-auto text-sm leading-relaxed">
              Without a field &mdash; without canonical paths, enforced
              boundaries, and immutable audit &mdash; systems trend toward
              disorder.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-3">
              <div className="p-5 rounded border border-white/[0.04] backdrop-blur-sm bg-white/[0.02]">
                <h3 className="text-sm font-mono text-[var(--text-secondary)] mb-2 tracking-wide">
                  AI Governance
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  Route AI requests through a governed pipeline. Policy is
                  evaluated before execution. Every decision, action, and outcome
                  is auditable.
                </p>
              </div>
              <div className="p-5 rounded border border-white/[0.04] backdrop-blur-sm bg-white/[0.02]">
                <h3 className="text-sm font-mono text-[var(--text-secondary)] mb-2 tracking-wide">
                  Event-Driven Platform
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  Build internal automation &mdash; CI/CD orchestration, incident
                  response, approval workflows &mdash; on a governed event backbone.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      {/* ===== SECTION 6: EXPLORE ===== */}
      <section className="min-h-screen flex items-center py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4 tracking-tight">
              Explore the Field
            </h2>
            <p className="text-[var(--text-tertiary)] text-sm mb-16 max-w-md mx-auto">
              The particles, the laws that govern them, and the philosophy
              behind the architecture.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0 }}
              >
                <Link
                  href="/particles"
                  className="group p-6 rounded border border-white/[0.04] border-l-[3px] border-l-blue-500/60 backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left block h-full"
                >
                  <div className="text-2xl sm:text-3xl font-display font-bold mb-1 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    10
                  </div>
                  <div className="text-sm font-mono text-[var(--text-secondary)] mb-1">Particles</div>
                  <div className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                    Every service, its physics analog, and what it must never do
                  </div>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link
                  href="/laws"
                  className="group p-6 rounded border border-white/[0.04] border-l-[3px] border-l-purple-500/60 backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left block h-full"
                >
                  <div className="text-2xl sm:text-3xl font-display font-bold mb-1 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    12
                  </div>
                  <div className="text-sm font-mono text-[var(--text-secondary)] mb-1">Laws</div>
                  <div className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                    Non-negotiable invariants that govern the field
                  </div>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link
                  href="/about"
                  className="group p-6 rounded border border-white/[0.04] border-l-[3px] border-l-cyan-500/60 backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left block h-full"
                >
                  <div className="text-2xl sm:text-3xl font-display font-bold mb-1 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    &infin;
                  </div>
                  <div className="text-sm font-mono text-[var(--text-secondary)] mb-1">Entropy</div>
                  <div className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                    The philosophy, the metaphor, and the two endgames
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
