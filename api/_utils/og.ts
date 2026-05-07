const BOT_UA_RE =
  /(facebookexternalhit|facebot|twitterbot|discordbot|slackbot|telegrambot|whatsapp|linkedinbot|embedly|pinterest|googlebot|bingbot)/i;

export function isBotUserAgent(userAgent: string | null) {
  if (!userAgent) return false;
  return BOT_UA_RE.test(userAgent);
}

export function getEnv(name: string, fallback?: string) {
  const v = process.env[name];
  if (v && v.trim().length > 0) return v.trim();
  return fallback;
}

export function absoluteUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export type OgPage = {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  type: "article" | "profile" | "website";
};

export function renderOgHtml(page: OgPage) {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const url = escapeHtml(page.url);
  const image = escapeHtml(page.imageUrl);
  const type = escapeHtml(page.type);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />

    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="Picka2" />
    <meta property="og:image" content="${image}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
  </head>
  <body>
    <a href="${url}">Abrir en Picka2</a>
  </body>
</html>`;
}

