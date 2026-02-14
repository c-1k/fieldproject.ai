import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/particles", label: "Particles" },
  { href: "/laws", label: "Laws" },
  { href: "/about", label: "About" },
];

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
    </footer>
  );
}
