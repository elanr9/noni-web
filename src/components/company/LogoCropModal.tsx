"use client";

/* The step between picking a logo and saving it: the picked image sits in
   the square creators will see, dragged into place and zoomed, then saved
   as that square. Every logo upload goes through here. */

import { Check, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import { saveCompanyLogo } from "@/app/admin/brain/actions";
import { Modal, Pill } from "@/components/kit";

const FRAME = 260;
const OUT = 512;
const MAX_ZOOM = 4;

type Size = { w: number; h: number };

export function LogoCropModal({ file, onClose, onSaved }: { file: File; onClose: () => void; onSaved: (path: string) => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const img = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    let live = true;
    const reader = new FileReader();
    reader.onload = () => {
      if (live && typeof reader.result === "string") setUrl(reader.result);
    };
    reader.onerror = () => {
      if (live) setError("That image could not be read.");
    };
    reader.readAsDataURL(file);
    return () => {
      live = false;
    };
  }, [file]);

  /* At zoom 1 the whole image fits the square. */
  const base = size ? FRAME / Math.max(size.w, size.h) : 1;
  const w = size ? size.w * base * zoom : FRAME;
  const h = size ? size.h * base * zoom : FRAME;
  const clamp = (o: { x: number; y: number }, cw = w, ch = h) => {
    const mx = Math.max(0, (cw - FRAME) / 2);
    const my = Math.max(0, (ch - FRAME) / 2);
    return { x: Math.min(mx, Math.max(-mx, o.x)), y: Math.min(my, Math.max(-my, o.y)) };
  };
  const at = clamp(offset);

  const onLoad = () => {
    const el = img.current;
    if (!el) return;
    const s = { w: el.naturalWidth || OUT, h: el.naturalHeight || OUT };
    setSize(s);
    /* A near-square mark fills the square; a wide wordmark starts whole. */
    const ratio = Math.max(s.w, s.h) / Math.min(s.w, s.h);
    setZoom(ratio <= 1.25 ? ratio : 1);
  };

  const setZoomTo = (z: number) => setZoom(Math.min(MAX_ZOOM, Math.max(1, z)));

  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: at.x, oy: at.y };
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d) setOffset(clamp({ x: d.ox + e.clientX - d.x, y: d.oy + e.clientY - d.y }));
  };
  const up = () => {
    drag.current = null;
  };

  const save = async () => {
    const el = img.current;
    if (!el || !size || busy) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("This browser cannot crop images.");
      const k = OUT / FRAME;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(el, (FRAME / 2 - w / 2 + at.x) * k, (FRAME / 2 - h / 2 + at.y) * k, w * k, h * k);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("That image could not be read.");
      const form = new FormData();
      form.set("logo", new File([blob], "logo.png", { type: "image/png" }));
      const r = await saveCompanyLogo(form);
      if (!r.ok) throw new Error(r.error);
      onSaved(r.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work. Try again.");
      setBusy(false);
    }
  };

  return (
    <Modal title="Your logo" onClose={onClose} width={340}>
      <div className="flex flex-col items-center gap-4">
        <div
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onWheel={(e) => setZoomTo(zoom - e.deltaY * 0.002)}
          className="relative cursor-grab touch-none select-none overflow-hidden border border-line bg-white active:cursor-grabbing"
          style={{
            width: FRAME,
            height: FRAME,
            borderRadius: FRAME * 0.28,
            backgroundImage: "linear-gradient(45deg,#f1f3f6 25%,transparent 25%,transparent 75%,#f1f3f6 75%),linear-gradient(45deg,#f1f3f6 25%,transparent 25%,transparent 75%,#f1f3f6 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 8px 8px",
          }}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={img}
              src={url}
              alt=""
              draggable={false}
              onLoad={onLoad}
              onError={() => setError("That image could not be read.")}
              className="pointer-events-none absolute max-w-none"
              style={{ width: w, height: h, left: FRAME / 2 - w / 2 + at.x, top: FRAME / 2 - h / 2 + at.y, opacity: size ? 1 : 0 }}
            />
          ) : null}
        </div>
        <div className="flex w-full items-center gap-2.5 text-slate-400" style={{ maxWidth: FRAME }}>
          <button type="button" aria-label="Zoom out" onClick={() => setZoomTo(zoom - 0.2)} className="cursor-pointer border-none bg-transparent p-0 text-slate-400 hover:text-ink">
            <Minus size={16} />
          </button>
          <input
            type="range"
            aria-label="Zoom"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoomTo(Number(e.target.value))}
            className="min-w-0 flex-1 cursor-pointer accent-blue-500"
          />
          <button type="button" aria-label="Zoom in" onClick={() => setZoomTo(zoom + 0.2)} className="cursor-pointer border-none bg-transparent p-0 text-slate-400 hover:text-ink">
            <Plus size={16} />
          </button>
        </div>
        {error ? <div className="text-center text-[13px] font-semibold text-danger">{error}</div> : null}
        <div className="flex w-full justify-end gap-2">
          <Pill variant="quiet" onClick={onClose}>
            Cancel
          </Pill>
          <Pill icon={Check} loading={busy} disabled={!size} onClick={() => void save()}>
            Save logo
          </Pill>
        </div>
      </div>
    </Modal>
  );
}
