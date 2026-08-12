"use client";

import { X } from "lucide-react";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const noopSubscribe = () => () => {};

export interface ModalProps {
  /** Empty or omitted title renders a floating close button instead. */
  title?: string;
  onClose: () => void;
  children: ReactNode;
  /** Panel width in px, default 460. */
  width?: number;
}

/* Always rendered through a portal on document.body: ancestor transforms
   (page/tab om-rise animations) trap position:fixed otherwise. */
export function Modal({ title, onClose, children, width = 460 }: ModalProps) {
  /* false during SSR, true on the client, where document.body exists. */
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  const closeBtn = (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border-none bg-fill-quiet rounded-pill"
    >
      <X size={15} className="text-slate-500" />
    </button>
  );

  return createPortal(
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim animate-om-fade"
    >
      <div
        className="relative overflow-y-auto bg-white p-[26px] shadow-raised rounded-ops-xl animate-om-pop"
        style={{ width, maxWidth: "calc(100vw - 48px)", maxHeight: "calc(100vh - 56px)" }}
      >
        {title ? (
          <div className="mb-[18px] flex items-center gap-3">
            <span className="flex-1 text-[18px] font-bold tracking-[-0.4px] text-ink">
              {title}
            </span>
            {closeBtn}
          </div>
        ) : (
          <div className="absolute right-[18px] top-[18px] z-[2]">{closeBtn}</div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
