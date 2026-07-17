import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PrototypeBD — 3D Printers, Laser Engravers & Filament in Bangladesh";
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
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0b1020 0%, #101935 46%, #1f1140 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#fdba74",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "4px",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#22c55e",
              display: "flex",
            }}
          />
          Dhaka, Bangladesh · Est. 2020
        </div>

        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: "-3px",
            marginTop: 28,
          }}
        >
          PrototypeBD
        </div>

        <div
          style={{
            display: "flex",
            color: "#c7d2fe",
            fontSize: 44,
            fontWeight: 600,
            marginTop: 16,
          }}
        >
          3D Printers · Laser Engravers · Filament
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "14px 30px",
              borderRadius: 999,
              background: "#f97316",
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            Shop now
          </div>
          <div
            style={{
              display: "flex",
              padding: "14px 30px",
              borderRadius: 999,
              border: "2px solid rgba(255,255,255,0.25)",
              color: "#e0e7ff",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            prototypebd.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
