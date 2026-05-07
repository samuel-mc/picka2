import type { VercelRequest, VercelResponse } from "@vercel/node";
import { absoluteUrl, getEnv, isBotUserAgent, renderOgHtml } from "../../_utils/og";

type PublicProfile = {
  id: number;
  name: string;
  lastname: string;
  username: string;
  bio: string | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ua = req.headers["user-agent"] ?? null;
  const userId = String(req.query.userId ?? "");

  const webBaseUrl = getEnv("WEB_BASE_URL", `https://${req.headers.host ?? "localhost"}`);
  const apiBaseUrl = getEnv("API_BASE_URL", getEnv("VITE_API_URL", "http://localhost:8080"));

  const canonicalUrl = absoluteUrl(webBaseUrl, `/perfil/${encodeURIComponent(userId)}`);
  const fallbackOgImage = absoluteUrl(webBaseUrl, "/api/og/image/default.png");

  if (!isBotUserAgent(typeof ua === "string" ? ua : null)) {
    res.statusCode = 302;
    res.setHeader("Location", canonicalUrl);
    res.end();
    return;
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

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
    res.end(html);
  } catch {
    const html = renderOgHtml({
      url: canonicalUrl,
      title: "Picka2 | Tipster",
      description: "Mira este perfil en Picka2.",
      imageUrl: fallbackOgImage,
      type: "profile",
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=600");
    res.end(html);
  }
}

