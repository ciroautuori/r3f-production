/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from "@jest/globals";
import { QualityContext } from "../store";

describe("Quality context (placeholder, runs once jest is wired)", () => {
  it("exposes quality + setter", () => {
    // Skipped until the example wires jest. Asserts nothing; shows the seam.
    expect(typeof QualityContext).toBe("object");
  });
});
