import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

type PublicProfile = {
  id: number;
  name: string;
  lastname: string;
  username: string;
  bio: string | null;
  followersCount?: number;
  followingCount?: number;
  validatedTipster?: boolean;
};

function env(name: string, fallback?: string) {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : fallback;
}

function truncate(text: string, max = 220) {
  const s = (text || "").trim().replace(/\s+/g, " ");
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}

const FALLBACK_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7W0n8AAAAASUVORK5CYII=";

function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const userId = parts[parts.length - 1] ?? "";
    const apiBaseUrl = env("API_BASE_URL", env("VITE_API_URL", "http://localhost:8080"));

    let profile: PublicProfile | null = null;
    try {
      const r = await fetch(
        `${apiBaseUrl.replace(/\/+$/, "")}/users/public/${encodeURIComponent(userId)}/profile`,
        { headers: { accept: "application/json" }, next: { revalidate: 3600 } } as any
      );
      if (r.ok) {
        profile = (await r.json()) as PublicProfile;
      }
    } catch {
      profile = null;
    }

    const fullName =
      profile ? `${profile.name ?? ""} ${profile.lastname ?? ""}`.trim() : `Tipster #${userId}`;
    const username = profile?.username ? `@${profile.username}` : "";
    const body = truncate(profile?.bio ?? `Mira el perfil de ${fullName} en Picka2.`);
    const badge = profile?.validatedTipster ? "Tipster validado" : "Tipster";

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
              "radial-gradient(900px 500px at 20% 25%, rgba(19,70,134,0.32), transparent 55%), radial-gradient(900px 500px at 80% 20%, rgba(254,178,26,0.28), transparent 55%), linear-gradient(180deg, #ffffff 0%, #f4f8fb 70%, #eef5fa 100%)",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 30,
                  background: "linear-gradient(135deg, #0f4c81, #ed5f2f)",
                  boxShadow: "0 22px 60px rgba(15,76,129,0.25)",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "rgba(15,76,129,0.9)" }}>
                  Picka2 · {badge}
                </div>
                <div style={{ fontSize: 48, fontWeight: 950, color: "#0b1f33", letterSpacing: -1 }}>
                  {fullName}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "rgba(71,85,105,0.9)" }}>
                  {username}
                </div>
              </div>
            </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 30,
              fontWeight: 850,
              color: "#0b1f33",
              lineHeight: 1.22,
              maxHeight: 220,
              overflow: "hidden",
            }}
          >
            {body}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 18,
            padding: "22px 26px",
            borderRadius: 28,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(203,213,225,0.9)",
            boxShadow: "0 26px 80px rgba(13,38,76,0.14)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(15,76,129,0.92)" }}>
            picka2 · perfil #{userId}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(71,85,105,0.9)" }}>
            Todos podemos ser tipster
          </div>
        </div>
        </div>
      ),
      { width: 1200, height: 630 }
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

