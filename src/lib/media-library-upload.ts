/* Browser side of a Media library upload. Files go straight from the
   browser to the private brief-assets bucket with the user's session
   client so storage RLS applies and a long recording never passes through
   a server action. Files up to 50 MB use a signed upload URL (same path
   as screenshots and the mobile app). Anything larger goes through
   Supabase's resumable (TUS) endpoint. Only imported by client components. */

import * as tus from "tus-js-client";

import {
  BRIEF_ASSETS_BUCKET,
  extensionForContentType,
  type MediaKind,
} from "@/lib/media-library-shared";
import { createClient } from "@/lib/supabase/client";

const TUS_THRESHOLD_BYTES = 50 * 1024 * 1024;
/** Supabase requires exactly 6 MB chunks on the resumable endpoint. */
const TUS_CHUNK_BYTES = 6 * 1024 * 1024;
const JPEG_QUALITY = 0.88;
const POSTER_TIME_SECONDS = 0.3;

export interface PreparedMedia {
  kind: MediaKind;
  blob: Blob;
  contentType: string;
  poster: Blob | null;
  durationMs: number | null;
  width: number | null;
  height: number | null;
}

export interface UploadedMedia {
  path: string;
  thumbPath: string | null;
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the image."))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the image.");
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

/** Every screenshot becomes a JPEG so HEIC never reaches the bucket. */
async function prepareScreenshot(file: File): Promise<PreparedMedia> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    try {
      await image.decode();
    } catch {
      throw new Error(`${file.name} could not be read in this browser.`);
    }
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const blob = await canvasToJpeg(drawToCanvas(image, width, height));
    return {
      kind: "screenshot",
      blob,
      contentType: "image/jpeg",
      poster: null,
      durationMs: null,
      width,
      height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function waitForEvent(
  target: HTMLMediaElement,
  event: string,
  timeoutMs = 4000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = () => {
      cleanup();
      resolve();
    };
    const fail = () => {
      cleanup();
      reject(new Error("Could not read the video."));
    };
    const timer = window.setTimeout(fail, timeoutMs);
    const cleanup = () => {
      window.clearTimeout(timer);
      target.removeEventListener(event, done);
      target.removeEventListener("error", fail);
    };
    target.addEventListener(event, done, { once: true });
    target.addEventListener("error", fail, { once: true });
  });
}

/** Recordings upload as they are. Metadata and the poster frame are best
    effort: a codec the browser cannot decode still lands in the library. */
async function prepareRecording(file: File): Promise<PreparedMedia> {
  const mime = file.type.toLowerCase();
  const contentType =
    mime === "video/quicktime" || /\.mov$/i.test(file.name)
      ? "video/quicktime"
      : "video/mp4";
  const base: PreparedMedia = {
    kind: "recording",
    blob: file,
    contentType,
    poster: null,
    durationMs: null,
    width: null,
    height: null,
  };
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  try {
    const metadata = waitForEvent(video, "loadedmetadata");
    video.src = objectUrl;
    await metadata;
    base.durationMs = Number.isFinite(video.duration)
      ? Math.round(video.duration * 1000)
      : null;
    base.width = video.videoWidth || null;
    base.height = video.videoHeight || null;

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      video.currentTime = Math.min(POSTER_TIME_SECONDS, Math.max(0, video.duration - 0.05));
      await waitForEvent(video, "seeked");
      base.poster = await canvasToJpeg(
        drawToCanvas(video, video.videoWidth, video.videoHeight),
      );
    }
  } catch {
    /* Keep whatever metadata was read; the tile falls back to the file. */
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
  return base;
}

export function prepareMedia(file: File, kind: MediaKind): Promise<PreparedMedia> {
  return kind === "screenshot" ? prepareScreenshot(file) : prepareRecording(file);
}

type SessionClient = ReturnType<typeof createClient>;

async function uploadResumable(
  supabase: SessionClient,
  path: string,
  blob: Blob,
  contentType: string,
  onProgress: (fraction: number) => void,
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sign in again to upload.");

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(blob, {
      endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        "x-upsert": "false",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: BRIEF_ASSETS_BUCKET,
        objectName: path,
        contentType,
        cacheControl: "3600",
      },
      chunkSize: TUS_CHUNK_BYTES,
      onError: (error) => reject(error),
      onProgress: (sent, total) => onProgress(total > 0 ? sent / total : 0),
      onSuccess: () => resolve(),
    });
    upload.start();
  });
}

async function uploadSigned(
  supabase: SessionClient,
  path: string,
  blob: Blob,
  contentType: string,
): Promise<void> {
  const bucket = supabase.storage.from(BRIEF_ASSETS_BUCKET);
  const { data, error } = await bucket.createSignedUploadUrl(path);
  if (error) throw error;
  const { error: uploadError } = await bucket.uploadToSignedUrl(path, data.token, blob, {
    contentType,
    cacheControl: "3600",
  });
  if (uploadError) throw uploadError;
}

async function uploadBlob(
  supabase: SessionClient,
  path: string,
  blob: Blob,
  contentType: string,
  onProgress: (fraction: number) => void,
): Promise<void> {
  if (blob.size > TUS_THRESHOLD_BYTES) {
    await uploadResumable(supabase, path, blob, contentType, onProgress);
  } else {
    await uploadSigned(supabase, path, blob, contentType);
  }
  onProgress(1);
}

/** Uploads the file and, for recordings, its poster. Paths match the app:
    <company>/library/<timestamp>.<ext> and <timestamp>-poster.jpg. */
export async function uploadToLibrary(
  companyId: string,
  prepared: PreparedMedia,
  onProgress: (fraction: number) => void,
): Promise<UploadedMedia> {
  const supabase = createClient();
  const stamp = Date.now();
  const path = `${companyId}/library/${stamp}.${extensionForContentType(prepared.contentType)}`;

  const posterShare = prepared.poster ? 0.08 : 0;
  await uploadBlob(supabase, path, prepared.blob, prepared.contentType, (fraction) =>
    onProgress(fraction * (1 - posterShare)),
  );

  let thumbPath: string | null = null;
  if (prepared.poster) {
    thumbPath = `${companyId}/library/${stamp}-poster.jpg`;
    await uploadBlob(supabase, thumbPath, prepared.poster, "image/jpeg", () => undefined);
    onProgress(1);
  }
  return { path, thumbPath };
}
