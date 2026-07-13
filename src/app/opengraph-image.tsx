import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "linear-gradient(135deg, #211f1a 0%, #2a2621 50%, #39301f 100%)",
        }}
      >
        <svg width="96" height="96" viewBox="72.8 44 140.4 162.6">
          <path d="M 82.8 196.56 L 82.8 54 L 104.976 76.176 L 104.976 168.048 Z" fill="#f3f1ea" />
          <path
            d="M 111.312 196.56 L 181.008 196.56 L 203.184 174.384 L 133.488 174.384 Z"
            fill="#d7d2cc"
          />
        </svg>
        <div
          style={{
            marginTop: 36,
            fontSize: 68,
            fontWeight: 600,
            color: "#f3f1ea",
            letterSpacing: "-0.02em",
          }}
        >
          Loriz Digital
        </div>
        <div style={{ marginTop: 18, fontSize: 30, color: "#a6a196" }}>
          Digitale Lösungen für Ihr Unternehmen
        </div>
      </div>
    ),
    { ...size },
  );
}
