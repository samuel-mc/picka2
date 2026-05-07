import type { VercelRequest, VercelResponse } from "@vercel/node";

// Placeholder: devuelve una imagen PNG simple.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  void req;

  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7W0n8AAAAASUVORK5CYII=";
  const buffer = Buffer.from(pngBase64, "base64");

  res.statusCode = 200;
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.end(buffer);
}

