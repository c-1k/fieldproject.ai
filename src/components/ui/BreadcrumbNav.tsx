import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-sm text-[var(--text-tertiary)] mb-8"
    >
      <ol className="flex items-center gap-1.5">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">›</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-[var(--text-secondary)] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--text-secondary)]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
