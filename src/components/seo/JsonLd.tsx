export default function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Field Project",
    headline: "Architecture as Counter-Force to Entropy",
    description:
      "An architecture for event-driven systems where every event passes through a governed pipeline of ingress, decisioning, policy evaluation, execution, and audit — each responsibility isolated in a named service modeled after a physics particle.",
    url: "https://fieldproject.ai",
    datePublished: "2025-01-01",
    dateModified: "2026-02-14",
    applicationCategory: "DeveloperApplication",
    author: {
      "@type": "Organization",
      name: "Field Project",
      url: "https://fieldproject.ai",
    },
    keywords: [
      "event-driven architecture",
      "AI governance",
      "physics metaphor",
      "policy-before-execution",
      "audit trail",
      "entropy",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
