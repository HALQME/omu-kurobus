import { describe, expect, it } from "vitest";
import { parseClassCode, extractTeachers, normalizeText } from "@/utils/common";

describe("Class Code Parser", () => {
    it("should normalize class code", () => {
        expect(parseClassCode("20241APA014001")).toBe("1AP");
    });

    it("should return original string if no match is found", () => {
        expect(parseClassCode("20241APA014001")).toBe("1AP");
    });

    it("should pad department ID with zeros if less than 3 characters", () => {
        expect(parseClassCode("1AA")).toBe("1AA");
        expect(parseClassCode("AA")).toBe("1AA");
    });

    it("should truncate department ID to 4 characters if more than 4", () => {
        expect(parseClassCode("2023E123")).toBe("E12");
        expect(parseClassCode("ABCDEF123")).toBe("EF1");
    });

    it("should keep department ID as is if it has 3 or 4 characters", () => {
        expect(parseClassCode("ABC123")).toBe("123");
        expect(parseClassCode("ABCD123")).toBe("123");
    });
});

describe("Teacher Extractor", () => {
    it("should return empty array if no teachers are found", () => {
        expect(extractTeachers("")).toEqual([]);
    });

    it("should return array of teachers", () => {
        expect(extractTeachers("田中 太郎、山本 一郎")).toEqual([
            "田中 太郎",
            "山本 一郎",
        ]);
    });
});

describe("Text Normalizer", () => {
    it("should trim whitespace from beginning and end", () => {
        expect(normalizeText("  test  ")).toBe("test");
    });

    it("should replace multiple spaces with single space", () => {
        expect(normalizeText("test  test")).toBe("test test");
    });

    it("should replace Japanese full-width spaces with single space", () => {
        expect(normalizeText("test　test")).toBe("test test");
    });

    it("should handle mixed space types", () => {
        expect(normalizeText("　test 　 test　")).toBe("test test");
    });

    it("should return empty string for whitespace-only input", () => {
        expect(normalizeText("   　　　 ")).toBe("");
    });
});
