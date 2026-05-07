import { absoluteUrl, getEnv, isBotUserAgent, renderOgHtml } from "../../_utils/og";

type PublicProfile = {
  id: number;
  name: string;
  lastname: string;
  username: string;
  bio: string | null;
};

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const ua = req.headers.get("user-agent");
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const userId = parts[parts.length - 1] ?? "";

  const webBaseUrl = getEnv("WEB_BASE_URL", `${url.protocol}//${url.host}`);
  const apiBaseUrl = getEnv("API_BASE_URL", getEnv("VITE_API_URL", "http://localhost:8080"));

  const canonicalUrl = absoluteUrl(webBaseUrl, `/perfil/${encodeURIComponent(userId)}`);
  const fallbackOgImage = absoluteUrl(webBaseUrl, "/api/og/image/default.png");

  if (!isBotUserAgent(ua)) {
    return new Response(null, { status: 302, headers: { Location: canonicalUrl } });
  }

  try {
    const apiUrl = absoluteUrl(apiBaseUrl, `/users/public/${encodeURIComponent(userId)}/profile`);
    const apiRes = await fetch(apiUrl, { headers: { accept: "application/json" } });
    if (!apiRes.ok) {
      throw new Error(`API status ${apiRes.status}`);
    }
    const profile = (await apiRes.json()) as PublicProfile;

    const fullName = `${profile.name ?? ""} ${profile.lastname ?? ""}`.trim() || `Tipster #${userId}`;
    const title = `Picka2 | Tipster: ${fullName}`;
    const description = (profile.bio ?? "").trim() || `Mira el perfil de ${fullName} en Picka2.`;
    const imageUrl = absoluteUrl(webBaseUrl, `/api/og/image/user/${encodeURIComponent(userId)}`);

    const html = renderOgHtml({
      url: canonicalUrl,
      title,
      description: description.length > 180 ? `${description.slice(0, 179).trimEnd()}…` : description,
      imageUrl: imageUrl || fallbackOgImage,
      type: "profile",
    });

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=3600",
      },
    });
  } catch {
    const html = renderOgHtml({
      url: canonicalUrl,
      title: "Picka2 | Tipster",
      description: "Mira este perfil en Picka2.",
      imageUrl: fallbackOgImage,
      type: "profile",
    });

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=60, s-maxage=600",
      },
    });
  }
}

