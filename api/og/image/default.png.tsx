import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

const FALLBACK_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7W0n8AAAAASUVORK5CYII=";

function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export default function handler() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px",
            background:
              "radial-gradient(900px 520px at 15% 20%, rgba(237,95,47,0.28), transparent 55%), radial-gradient(900px 520px at 85% 25%, rgba(19,70,134,0.32), transparent 55%), linear-gradient(180deg, #f7fbff 0%, #eef5fa 60%, #f9fbfd 100%)",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 24,
                background: "linear-gradient(135deg, #0f4c81, #ed5f2f)",
                boxShadow: "0 22px 60px rgba(15,76,129,0.25)",
              }}
            />
            <div style={{ fontSize: 44, fontWeight: 950, color: "#0b1f33", letterSpacing: -1 }}>
              Picka2
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 54, fontWeight: 1000, color: "#0b1f33", letterSpacing: -1.2 }}>
              Todos podemos ser tipster
            </div>
            <div style={{ fontSize: 26, fontWeight: 850, color: "rgba(71,85,105,0.9)" }}>
              Picks · parleys · análisis
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              padding: "22px 26px",
              borderRadius: 28,
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(203,213,225,0.9)",
              boxShadow: "0 26px 80px rgba(13,38,76,0.14)",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(15,76,129,0.92)" }}>picka2</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(71,85,105,0.9)" }}>
              comunidad de apuestas deportivas
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      }
    );
  } catch {
    return new Response(base64ToUint8Array(FALLBACK_PNG_BASE64), {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=3600, s-maxage=86400",
      },
    });
  }
}

