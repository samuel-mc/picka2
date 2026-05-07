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

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const ua = req.headers.get("user-agent");
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const postId = parts[parts.length - 1] ?? "";

  const webBaseUrl = getEnv("WEB_BASE_URL", `${url.protocol}//${url.host}`);
  const apiBaseUrl = getEnv("API_BASE_URL", getEnv("VITE_API_URL", "http://localhost:8080"));

  const canonicalUrl = absoluteUrl(webBaseUrl, `/posts/${encodeURIComponent(postId)}`);
  const fallbackOgImage = absoluteUrl(webBaseUrl, "/api/og/image/default.png");

  if (!isBotUserAgent(ua)) {
    return new Response(null, {
      status: 302,
      headers: { Location: canonicalUrl },
    });
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
      title: "Picka2 | Post",
      description: "Mira este post en Picka2.",
      imageUrl: fallbackOgImage,
      type: "article",
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

