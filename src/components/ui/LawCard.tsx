"use client";

import ScrollReveal from "./ScrollReveal";

interface LawCardProps {
  number: number;
  title: string;
  statement: string;
  delay?: number;
}

export default function LawCard({ number, title, statement, delay = 0 }: LawCardProps) {
  return (
    <ScrollReveal delay={delay}>
      <div className="flex gap-4 p-4 rounded-lg border-l-2 border-[var(--accent)] bg-transparent hover:bg-[var(--bg-surface)] transition-colors">
        <div className="w-10 h-10 rounded-full border border-[var(--accent)] flex items-center justify-center text-base font-mono text-[var(--accent)] shrink-0">
          {number}
        </div>
        <div>
          <h3 className="font-semibold font-display mb-1">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {statement}
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}
