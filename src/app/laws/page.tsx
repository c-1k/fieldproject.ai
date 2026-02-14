import type { Metadata } from "next";
import { LAWS } from "@/lib/laws";
import LawCard from "@/components/ui/LawCard";
import BreadcrumbNav from "@/components/ui/BreadcrumbNav";

export const metadata: Metadata = {
  title: "Laws — Field Project",
  description:
    "The 12 Laws of the Field: non-negotiable invariants governing the Field Project architecture.",
};

const EXECUTION_LAWS = LAWS.filter((l) => l.number <= 6);
const SYSTEM_LAWS = LAWS.filter((l) => l.number > 6);

export default function LawsPage() {
  return (
    <main className="min-h-screen py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <BreadcrumbNav items={[{ label: "Home", href: "/" }, { label: "Laws" }]} />

        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight mb-4">
            The 12 Laws of the Field
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Non-negotiable invariants. Every particle, every event, every
            decision is bound by these laws. No single service can override them.
          </p>
        </div>

        {/* Execution Constraints (Laws 1-6) */}
        <section className="mb-12 sm:mb-16">
          <div className="text-[72px] sm:text-[120px] font-display font-bold text-[var(--text-primary)] opacity-[0.03] leading-none select-none -mb-10 sm:-mb-16">1—6</div>
          <h2 className="text-xl sm:text-2xl font-bold font-display mb-2">Execution Constraints</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8">
            Laws 1–6 govern how events are processed, decisions are made, and
            side effects are executed.
          </p>

          <div className="space-y-3">
            {EXECUTION_LAWS.map((law, i) => (
              <LawCard
                key={law.number}
                number={law.number}
                title={law.title}
                statement={law.statement}
                delay={i * 0.05}
              />
            ))}
          </div>
        </section>

        {/* System Constraints (Laws 7-12) */}
        <section className="mb-12 sm:mb-16">
          <div className="text-[72px] sm:text-[120px] font-display font-bold text-[var(--text-primary)] opacity-[0.03] leading-none select-none -mb-10 sm:-mb-16">7—12</div>
          <h2 className="text-xl sm:text-2xl font-bold font-display mb-2">System Constraints</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8">
            Laws 7–12 govern boundaries, configuration, isolation, and the
            system&apos;s relationship to entropy.
          </p>

          <div className="space-y-3">
            {SYSTEM_LAWS.map((law, i) => (
              <LawCard
                key={law.number}
                number={law.number}
                title={law.title}
                statement={law.statement}
                delay={i * 0.05}
              />
            ))}
          </div>
        </section>

        {/* Back link */}
        <div className="text-center">
          <a
            href="/"
            className="inline-block text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors py-2 px-4"
          >
            &larr; Back to the Field
          </a>
        </div>
      </div>
    </main>
  );
}
