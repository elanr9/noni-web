/* Noni-made screenshots. Takes the admin's raw feature screenshots plus the
   feature sentence and produces one polished, video-ready product shot:
   phone shaped (1024x1536) for apps and web apps, laptop shaped (1536x1024)
   for websites. Campaign managers overlay these on brief clips. */

import type { ScreenshotShape } from "./types";

export interface ScreenshotReference {
  mime: string;
  bytes: Buffer;
}

const SIZE: Record<ScreenshotShape, "1024x1536" | "1536x1024"> = {
  phone: "1024x1536",
  laptop: "1536x1024",
};

const FRAME_LINE: Record<ScreenshotShape, string> = {
  phone:
    "Frame it as a tall phone screen capture, the way a product screenshot looks when overlaid on a vertical TikTok video.",
  laptop:
    "Frame it as a wide laptop browser screen capture with a minimal browser chrome bar at the top.",
};

function buildPrompt(input: {
  shape: ScreenshotShape;
  featureName: string;
  sentence: string;
  product: string;
}): string {
  const name = input.featureName.trim() || "this feature";
  return [
    `Recreate the referenced product screenshot as one flawless, pixel-perfect UI shot of ${name}.`,
    `What the feature does: ${input.sentence.trim()}`,
    input.product.trim() ? `Product context: ${input.product.trim().slice(0, 600)}` : "",
    FRAME_LINE[input.shape],
    "Keep the real interface layout, colors, typography and copy from the reference. Sharpen everything: crisp text, aligned spacing, clean rounded corners, soft neutral background behind the screen.",
    "Remove any personal data, notification bars, cursors, or clutter. No watermarks, no captions, no device hands, no added marketing text.",
    "The result must look like a perfect first-party screenshot a design team would ship, instantly readable in under two seconds inside a short video.",
  ]
    .filter(Boolean)
    .join("\n");
}

interface ImageResponse {
  error?: { message?: string };
  data?: Array<{ b64_json?: string }>;
}

export async function renderNoniScreenshot(input: {
  shape: ScreenshotShape;
  featureName: string;
  sentence: string;
  product: string;
  references: ScreenshotReference[];
}): Promise<{ ok: true; png: Buffer } | { ok: false; error: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error: "Noni screenshots are not configured. Add OPENAI_API_KEY on the server.",
    };
  }
  if (input.references.length === 0) {
    return { ok: false, error: "Upload at least one screenshot of the feature first." };
  }

  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("prompt", buildPrompt(input));
  form.append("size", SIZE[input.shape]);
  form.append("quality", "high");
  for (const ref of input.references.slice(0, 4)) {
    form.append(
      "image[]",
      new Blob([new Uint8Array(ref.bytes)], { type: ref.mime }),
      "reference.png",
    );
  }

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const json = (await res.json()) as ImageResponse;
  if (!res.ok) {
    return { ok: false, error: json.error?.message ?? `OpenAI ${res.status}` };
  }
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) return { ok: false, error: "OpenAI returned no image." };
  return { ok: true, png: Buffer.from(b64, "base64") };
}
