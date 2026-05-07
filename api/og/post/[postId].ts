import type { VercelRequest, VercelResponse } from "@vercel/node";
import { absoluteUrl, getEnv, isBotUserAgent, renderOgHtml } from "../../_utils/og";

type ApiResponse<T> = { success?: boolean; message?: string; data: T };

type Post = {
  id: number;
  type: "ANALYSIS" | "PICK_SIMPLE" | "PARLEY";
  content: string;
  author?: { name?: string };
};

function pickDescription(post: Post) {
  const base = (post.content || "").trim().replace(/\s+/g, " ");
  if (!base) return "Mira este post en Picka2.";
  return base.length > 180 ? `${base.slice(0, 179).trimEnd()}…` : base;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ua = req.headers["user-agent"] ?? null;
  const postId = String(req.query.postId ?? "");

  const webBaseUrl = getEnv("WEB_BASE_URL", `https://${req.headers.host ?? "localhost"}`);
  const apiBaseUrl = getEnv("API_BASE_URL", getEnv("VITE_API_URL", "http://localhost:8080"));

  const canonicalUrl = absoluteUrl(webBaseUrl, `/posts/${encodeURIComponent(postId)}`);
  const fallbackOgImage = absoluteUrl(webBaseUrl, "/api/og/image/default.png");

  if (!isBotUserAgent(typeof ua === "string" ? ua : null)) {
    res.statusCode = 302;
    res.setHeader("Location", canonicalUrl);
    res.end();
    return;
  }

  try {
    const apiUrl = absoluteUrl(apiBaseUrl, `/posts/public/${encodeURIComponent(postId)}`);
    const apiRes = await fetch(apiUrl, { headers: { accept: "application/json" } });
    if (!apiRes.ok) {
      throw new Error(`API status ${apiRes.status}`);
    }
    const json = (await apiRes.json()) as ApiResponse<Post>;
    const post = json.data;

    const author = post?.author?.name?.trim() || "Tipster";
    const title = `Picka2 | Post #${postId} — ${author}`;
    const description = pickDescription(post);
    const imageUrl = absoluteUrl(webBaseUrl, `/api/og/image/post/${encodeURIComponent(postId)}`);

    const html = renderOgHtml({
      url: canonicalUrl,
      title,
      description,
      imageUrl: imageUrl || fallbackOgImage,
      type: "article",
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
    res.end(html);
  } catch {
    const html = renderOgHtml({
      url: canonicalUrl,
      title: "Picka2 | Post",
      description: "Mira este post en Picka2.",
      imageUrl: fallbackOgImage,
      type: "article",
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=600");
    res.end(html);
  }
}

