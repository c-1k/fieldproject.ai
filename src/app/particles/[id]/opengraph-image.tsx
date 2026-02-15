import { ImageResponse } from "next/og";
import {
  PARTICLES,
  CORE_PARTICLES,
  SUPPORTING_PARTICLES,
} from "@/lib/particles";

/* ── Static generation ── */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ALL_IDS = [...CORE_PARTICLES, ...SUPPORTING_PARTICLES];

export function generateStaticParams() {
  return ALL_IDS.map((id) => ({ id }));
}

/* ── OG Image ── */

export default async function OgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const particle = PARTICLES[id];

  if (!particle) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#050505",
            color: "#ffffff",
            fontSize: 48,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Field Project
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#050505",
          padding: "80px 100px",
          fontFamily: "Inter, sans-serif",
          position: "relative",
        }}
      >
        {/* Accent line — top edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 100,
            width: 120,
            height: 4,
            backgroundColor: particle.color,
            borderRadius: 2,
          }}
        />

        {/* Particle name + accent dot */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {particle.name}
          </div>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: particle.color,
              opacity: 0.8,
            }}
          />
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "#8b8b8b",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          {particle.subtitle}
        </div>

        {/* Role — truncated to ~2 lines */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: "#6a6a6a",
            lineHeight: 1.5,
            maxWidth: 900,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {particle.role.length > 180
            ? particle.role.slice(0, 177) + "..."
            : particle.role}
        </div>

        {/* Bottom bar: site name + accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 100,
            right: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 400,
              color: "#4a4a4a",
              letterSpacing: "0.04em",
            }}
          >
            fieldproject.ai
          </div>
          <div
            style={{
              width: 60,
              height: 3,
              backgroundColor: particle.color,
              borderRadius: 2,
              opacity: 0.5,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
