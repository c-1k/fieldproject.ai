import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Field Project — Architecture as Counter-Force to Entropy";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0e14",
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}
        >
          FIELD PROJECT
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            opacity: 0.7,
            letterSpacing: "0.04em",
          }}
        >
          Architecture as Counter-Force to Entropy
        </div>
      </div>
    ),
    { ...size }
  );
}
