import { describe, expect, it } from "vitest";
import {
    getAutocompleteSuggestions,
    getCampusNameSuggestions,
} from "../utils/suggest";
import { type Course } from "../types/schema";
import { generateMockData } from "../utils/_mock";

const mockData = generateMockData();

describe("Autocomplete Suggestions", () => {
    it("should return empty array if search text is empty", () => {
        const courses: Course[] = mockData.data;
        expect(getAutocompleteSuggestions("", courses, "course")).toEqual([]);
    });

    it("should return empty array if no match is found", () => {
        const courses: Course[] = mockData.data;
        expect(getAutocompleteSuggestions("zzz", courses, "course")).toEqual(
            []
        );
    });

    it("should return suggestions for course names", () => {
        const courses: Course[] = mockData.data;
        const suggestions = getAutocompleteSuggestions(
            "情報セキュ",
            courses,
            "course"
        );
        console.log(suggestions.length);
        console.log(suggestions);
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions[0]).toEqual({
            text: "情報セキュリティ",
            score: expect.any(Number),
            details: {
                teachers: "宮本 貴朗",
                campus: "中百舌鳥",
                classCode: "1AA",
            },
        });
        expect(suggestions[1]).toEqual({
            text: "情報セキュリティ特論",
            score: expect.any(Number),
            details: {
                teachers: "宮本 貴朗",
                campus: "遠隔用",
                classCode: "1BG",
            },
        });
    });
});