import type { Metadata } from "next";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";
import JsonLd from "@/components/seo/JsonLd";
import "./globals.css";

export const metadata: Metadata = {
  title: "Field Project — Architecture as Counter-Force to Entropy",
  description:
    "An architecture for event-driven systems where every event passes through a governed pipeline of ingress, decisioning, policy evaluation, execution, and audit — each responsibility isolated in a named service modeled after a physics particle.",
  metadataBase: new URL("https://fieldproject.ai"),
  openGraph: {
    title: "Field Project — Architecture as Counter-Force to Entropy",
    description:
      "Event-driven architecture with governed pipelines, physics-particle services, and 12 invariant laws.",
    url: "https://fieldproject.ai",
    siteName: "Field Project",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Field Project",
    description: "Architecture as counter-force to entropy.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body>
        <JsonLd />
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
