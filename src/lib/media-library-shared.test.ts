import { describe, expect, it } from "vitest";

import { checkMediaFile, MAX_MEDIA_BYTES, normalizeThemeHex } from "./media-library-shared";

describe("normalizeThemeHex", () => {
  it("uppercases and adds the hash", () => {
    expect(normalizeThemeHex("ea403f")).toBe("#EA403F");
    expect(normalizeThemeHex("#ea403f")).toBe("#EA403F");
    expect(normalizeThemeHex("  #3496F0 ")).toBe("#3496F0");
  });

  it("rejects anything that is not six hex digits", () => {
    expect(normalizeThemeHex("")).toBeNull();
    expect(normalizeThemeHex("#fff")).toBeNull();
    expect(normalizeThemeHex("#EA403FF")).toBeNull();
    expect(normalizeThemeHex("#GGGGGG")).toBeNull();
    expect(normalizeThemeHex("red")).toBeNull();
  });
});

describe("checkMediaFile", () => {
  const file = (type: string, size = 1024, name = "file") => ({ type, size, name });

  it("maps images to screenshots and videos to recordings", () => {
    expect(checkMediaFile(file("image/jpeg"))).toEqual({ ok: true, kind: "screenshot" });
    expect(checkMediaFile(file("image/png"))).toEqual({ ok: true, kind: "screenshot" });
    expect(checkMediaFile(file("image/webp"))).toEqual({ ok: true, kind: "screenshot" });
    expect(checkMediaFile(file("image/heic"))).toEqual({ ok: true, kind: "screenshot" });
    expect(checkMediaFile(file("video/mp4"))).toEqual({ ok: true, kind: "recording" });
    expect(checkMediaFile(file("video/quicktime"))).toEqual({ ok: true, kind: "recording" });
  });

  it("rejects other mimes", () => {
    expect(checkMediaFile(file("image/gif")).ok).toBe(false);
    expect(checkMediaFile(file("video/webm")).ok).toBe(false);
    expect(checkMediaFile(file("application/pdf")).ok).toBe(false);
    expect(checkMediaFile(file("")).ok).toBe(false);
  });

  it("rejects files over 200 MB and keeps the limit itself", () => {
    expect(checkMediaFile(file("video/mp4", MAX_MEDIA_BYTES)).ok).toBe(true);
    const tooBig = checkMediaFile(file("video/mp4", MAX_MEDIA_BYTES + 1, "big.mp4"));
    expect(tooBig.ok).toBe(false);
    if (!tooBig.ok) expect(tooBig.error).toContain("big.mp4");
  });
});
