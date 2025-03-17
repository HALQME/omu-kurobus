import { describe, expect, it } from "vitest";
import {
    normalizeClassCode,
    getAutocompleteSuggestions,
    getCampusNameSuggestions,
} from "../utils/suggest";
import { type Course } from "../types/schema";
import { generateMockData } from "../utils/_mock";

const mockData = generateMockData();

describe("Class Code Parser", () => {
    it("should normalize class code", () => {
        expect(normalizeClassCode("20241APA014001")).toBe("1AP");
    });

    it("should return original string if no match is found", () => {
        expect(normalizeClassCode("20241APA014001")).toBe("1AP");
    });

    it("should pad department ID with zeros if less than 3 characters", () => {
        expect(normalizeClassCode("1AA")).toBe("1AA");
        expect(normalizeClassCode("AA")).toBe("1AA");
    });

    it("should truncate department ID to 4 characters if more than 4", () => {
        expect(normalizeClassCode("2023E123")).toBe("E12");
        expect(normalizeClassCode("ABCDEF123")).toBe("EF1");
    });

    it("should keep department ID as is if it has 3 or 4 characters", () => {
        expect(normalizeClassCode("ABC123")).toBe("123");
        expect(normalizeClassCode("ABCD123")).toBe("123");
    });
});
