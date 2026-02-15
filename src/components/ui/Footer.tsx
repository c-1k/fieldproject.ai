import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/particles", label: "Particles" },
  { href: "/laws", label: "Laws" },
  { href: "/about", label: "About" },
];

export default function Footer() {
  return (
    <footer className="relative pt-20 pb-12 px-6 bg-gradient-to-b from-transparent to-[var(--bg-elevated)]">
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 79px, currentColor 79px, currentColor 80px)",
          opacity: 0.03,
        }}
      />
      <div className="relative max-w-5xl mx-auto">
        {/* Separator */}
        <div className="border-t border-[var(--border)] mb-6" />

        {/* Tagline */}
        <p className="text-sm italic text-[var(--text-tertiary)] text-center mb-8">
          Architecture as counter-force to entropy
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="text-base font-semibold font-display text-[var(--text-tertiary)]">
            Field Project
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-sm text-[var(--text-tertiary)]">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[var(--text-secondary)] transition-colors py-3 sm:py-2"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-tertiary)]">
          <span>&copy; 2026 Field Project. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/c-1k/fermion"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text-secondary)] transition-colors py-2"
            >
              GitHub
            </a>
            <a
              href="mailto:hello@fieldproject.ai"
              className="hover:text-[var(--text-secondary)] transition-colors py-2"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
