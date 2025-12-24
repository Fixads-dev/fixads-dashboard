import { describe, expect, it } from "vitest";
import { getSearchTermStatusColor, getSearchTermStatusLabel } from "@/features/search-terms/types";

describe("Search Terms Type Helpers", () => {
  describe("getSearchTermStatusLabel", () => {
    it("returns Not added for NONE", () => {
      expect(getSearchTermStatusLabel("NONE")).toBe("Not added");
    });

    it("returns Added as keyword for ADDED", () => {
      expect(getSearchTermStatusLabel("ADDED")).toBe("Added as keyword");
    });

    it("returns Excluded for EXCLUDED", () => {
      expect(getSearchTermStatusLabel("EXCLUDED")).toBe("Excluded");
    });

    it("returns Added & Excluded for ADDED_EXCLUDED", () => {
      expect(getSearchTermStatusLabel("ADDED_EXCLUDED")).toBe("Added & Excluded");
    });

    it("returns Unknown for UNSPECIFIED", () => {
      expect(getSearchTermStatusLabel("UNSPECIFIED")).toBe("Unknown");
    });
  });

  describe("getSearchTermStatusColor", () => {
    it("returns gray for NONE", () => {
      expect(getSearchTermStatusColor("NONE")).toBe("gray");
    });

    it("returns green for ADDED", () => {
      expect(getSearchTermStatusColor("ADDED")).toBe("green");
    });

    it("returns red for EXCLUDED", () => {
      expect(getSearchTermStatusColor("EXCLUDED")).toBe("red");
    });

    it("returns yellow for ADDED_EXCLUDED", () => {
      expect(getSearchTermStatusColor("ADDED_EXCLUDED")).toBe("yellow");
    });

    it("returns gray for UNSPECIFIED", () => {
      expect(getSearchTermStatusColor("UNSPECIFIED")).toBe("gray");
    });
  });
});
