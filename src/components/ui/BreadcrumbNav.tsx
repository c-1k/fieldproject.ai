import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-xs sm:text-sm text-[var(--text-tertiary)] mb-6 sm:mb-8"
    >
      <ol className="flex items-center gap-1 sm:gap-1.5 min-w-0">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            {i > 0 && <span aria-hidden="true" className="shrink-0">›</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-[var(--text-secondary)] transition-colors py-1 truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--text-secondary)] truncate">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
