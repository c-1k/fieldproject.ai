import type { Metadata, Viewport } from "next";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";
import JsonLd from "@/components/seo/JsonLd";
import ParticleBackground from "@/components/canvas/ParticleBackground";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Field Project — Architecture as Counter-Force to Entropy",
  description:
    "An architecture for event-driven systems where every event passes through a governed pipeline of ingress, decisioning, policy evaluation, execution, and audit — each responsibility isolated in a named service modeled after a physics particle.",
  metadataBase: new URL("https://fieldproject.ai"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Field Project — Architecture as Counter-Force to Entropy",
    description:
      "Event-driven architecture with governed pipelines, physics-particle services, and 12 invariant laws.",
    url: "https://fieldproject.ai",
    siteName: "Field Project",
    type: "website",
    locale: "en_US",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap"
        />
      </head>
      <body>
        <JsonLd />
        <ParticleBackground />
        <Navigation />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
