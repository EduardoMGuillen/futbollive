import { describe, expect, it } from "vitest";
import { initials, slugify, statusFromDate } from "./utils";

describe("sports data utilities", () => {
  it("creates stable SEO slugs from Spanish names", () => {
    expect(slugify("Bayern Múnich")).toBe("bayern-munich");
    expect(slugify("Fútbol / América")).toBe("futbol-america");
  });

  it("creates readable fallback initials", () => {
    expect(initials("Real Madrid")).toBe("RM");
    expect(initials("Brasil")).toBe("B");
  });

  it("derives upcoming and live states from dates", () => {
    expect(statusFromDate(new Date(Date.now() + 60_000).toISOString())).toBe("upcoming");
    expect(statusFromDate(new Date(Date.now() - 60_000).toISOString())).toBe("live");
  });
});
