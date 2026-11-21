import { describe, expect, it } from "vitest";

import { overlayBoxFill, overlayTextContrast } from "./overlay-text";

describe("post text colors", () => {
  it("draws TikTok blue as the measured tinted bubble with deep blue letters", () => {
    expect(overlayBoxFill("#3496F0")).toBe("#80B6F4");
    expect(overlayTextContrast("#3496F0")).toBe("#000590");
  });

  it("keeps white and black picks as they are", () => {
    expect(overlayBoxFill("#FFFFFF")).toBe("#FFFFFF");
    expect(overlayTextContrast("#FFFFFF")).toBe("#000000");
    expect(overlayBoxFill("#000000")).toBe("#000000");
    expect(overlayTextContrast("#000000")).toBe("#FFFFFF");
  });

  it("tints any other hue light and inks it dark", () => {
    expect(overlayBoxFill("#EA403F")).toMatch(/^#[0-9a-f]{6}$/);
    expect(overlayBoxFill("#EA403F")).not.toBe("#EA403F");
    expect(overlayTextContrast("#EA403F")).not.toBe("#FFFFFF");
  });
});
