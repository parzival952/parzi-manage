import { ImageResponse } from "next/og";
import { LESSON_COUNT } from "@/lib/academy-course";

// Aperçu de partage (WhatsApp, LinkedIn, X…) de toutes les pages Academy.
export const alt = "PARZI Academy — Deviens agent de joueur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "radial-gradient(ellipse at 20% 0%, #3a0010 0%, #0A0A0C 55%)",
          color: "#F5F6F8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "22px",
              background: "linear-gradient(135deg, #C21833, #7A1024)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "52px",
              fontWeight: 900,
            }}
          >
            P
          </div>
          <div style={{ display: "flex", fontSize: "52px", fontWeight: 800 }}>
            PARZI&nbsp;<span style={{ color: "#C21833" }}>Academy</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: "72px", fontWeight: 900, marginTop: "56px", lineHeight: 1.1 }}>
          Deviens agent de joueur.
        </div>
        <div style={{ display: "flex", fontSize: "32px", color: "var(--gris)", marginTop: "24px" }}>
          {LESSON_COUNT} leçons · révision intelligente · examen blanc de la licence d&apos;agent
        </div>
      </div>
    ),
    { ...size },
  );
}
