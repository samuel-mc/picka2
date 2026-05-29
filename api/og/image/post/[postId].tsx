import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

type ApiResponse<T> = { data: T };

type Post = {
  id: number;
  type: "ANALYSIS" | "PICK_SIMPLE" | "PARLEY";
  content: string;
  createdAt?: string;
  author?: { name?: string; username?: string };
  simplePick?: { sport?: string; league?: string; stake?: number; eventDate?: string } | null;
  parley?: { stake?: number; eventDate?: string } | null;
  parleySelections?: Array<{ sport?: string; league?: string }> | null;
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

function labelFromPost(post: Post) {
  if (post.type === "PICK_SIMPLE" && post.simplePick) {
    const sport = post.simplePick.sport ?? "Pick";
    const league = post.simplePick.league ? ` · ${post.simplePick.league}` : "";
    return `${sport}${league}`;
  }
  if (post.type === "PARLEY") {
    const count = post.parleySelections?.length ?? 0;
    return count > 0 ? `Parley · ${count} selecciones` : "Parley";
  }
  return "Análisis";
}

const FALLBACK_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7W0n8AAAAASUVORK5CYII=";

function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

type NextRevalidateInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const postId = parts[parts.length - 1] ?? "";
    const apiBaseUrl = env("API_BASE_URL", env("VITE_API_URL", "http://localhost:8080"));

    let post: Post | null = null;
    try {
      const r = await fetch(
        `${apiBaseUrl.replace(/\/+$/, "")}/posts/public/${encodeURIComponent(postId)}`,
        {
          headers: { accept: "application/json" },
          next: { revalidate: 3600 },
        } as NextRevalidateInit
      );
      if (r.ok) {
        const json = (await r.json()) as ApiResponse<Post>;
        post = json.data;
      }
    } catch {
      post = null;
    }

    const author = post?.author?.name?.trim() || "Tipster";
    const username = post?.author?.username ? `@${post.author.username}` : "";
    const headline = `Picka2`;
    const sub = post ? labelFromPost(post) : "Post";
    const body = truncate(post?.content ?? "Mira este post en Picka2.");

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
              "radial-gradient(900px 500px at 20% 20%, rgba(237,95,47,0.28), transparent 55%), radial-gradient(900px 500px at 80% 25%, rgba(19,70,134,0.32), transparent 55%), linear-gradient(180deg, #f7fbff 0%, #eef5fa 60%, #f9fbfd 100%)",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  background: "linear-gradient(135deg, #0f4c81, #ed5f2f)",
                  boxShadow: "0 18px 45px rgba(15,76,129,0.22)",
                }}
              />
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0b1f33", letterSpacing: -0.5 }}>
                {headline}
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 16,
                  fontWeight: 700,
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(203,213,225,0.9)",
                  color: "#0f4c81",
                }}
              >
                {sub}
              </div>
            </div>

          <div
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: "#0b1f33",
              lineHeight: 1.12,
              letterSpacing: -1,
              maxHeight: 210,
              overflow: "hidden",
            }}
          >
            {body}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 18,
            padding: "22px 26px",
            borderRadius: 28,
            background: "rgba(255,255,255,0.82)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 26px 80px rgba(13,38,76,0.18)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0b1f33" }}>{author}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(15,76,129,0.85)" }}>{username}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(71,85,105,0.9)" }}>
            picka2 · post #{postId}
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
