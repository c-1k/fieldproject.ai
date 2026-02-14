import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/particles", label: "Particles" },
  { href: "/laws", label: "Laws" },
  { href: "/about", label: "About" },
];

export default function Footer() {
  return (
    <footer className="pt-12 pb-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Separator */}
        <div className="border-t border-[var(--border)] mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="text-sm text-[var(--text-tertiary)]">
            Field Project
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-tertiary)]">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[var(--text-secondary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-tertiary)]">
          <span>&copy; 2026 Field Project. All rights reserved.</span>
          <a
            href="https://github.com/fieldproject"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-secondary)] transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
