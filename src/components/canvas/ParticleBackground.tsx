"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { PARTICLES } from "@/lib/particles";
import { SECTION_COUNT } from "@/lib/constants";

const QuantumFieldWrapper = dynamic(
  () => import("@/components/canvas/QuantumFieldWrapper"),
  { ssr: false },
);

function getFormationText(pathname: string): string {
  if (pathname === "/") return "FIELD PROJECT";
  if (pathname === "/particles") return "PARTICLES";
  if (pathname === "/laws") return "LAWS";
  if (pathname === "/about") return "ABOUT";
  if (pathname === "/architecture") return "ARCHITECTURE";

  const match = pathname.match(/^\/particles\/(.+)$/);
  if (match) {
    const id = match[1]!;
    const particle = PARTICLES[id];
    if (particle) return particle.name.toUpperCase();
  }

  return "FIELD PROJECT";
}

export default function ParticleBackground() {
  const pathname = usePathname();
  const formationText = getFormationText(pathname);
  const isHome = pathname === "/";

  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const p = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
      const next = Math.min(
        Math.floor(p * SECTION_COUNT),
        SECTION_COUNT - 1,
      );
      setActiveSection((prev) => (prev !== next ? next : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const opacity = isHome ? (activeSection === 0 ? 1 : 0.25) : 0.3;

  return (
    <div
      className="fixed inset-0 -z-10 transition-opacity duration-700"
      style={{ opacity }}
    >
      <QuantumFieldWrapper formationText={formationText} />
    </div>
  );
}
