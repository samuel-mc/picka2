import type { VercelRequest, VercelResponse } from "@vercel/node";

// Placeholder: devuelve una imagen 1200x630 simple (PNG) sin depender de libs.
// Más adelante se puede reemplazar por una imagen dinámica real.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  void req;

  // 1x1 PNG transparente (se estira en previews, pero sirve para habilitar OG end-to-end)
  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7W0n8AAAAASUVORK5CYII=";
  const buffer = Buffer.from(pngBase64, "base64");

  res.statusCode = 200;
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.end(buffer);
}

