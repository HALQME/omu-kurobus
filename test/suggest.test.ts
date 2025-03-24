import { describe, expect, it } from "vitest";
import { getAutocompleteSuggestions } from "@/utils/suggest";
import { type CourseSummary } from "@/types/schema";

import mockData from "test/_embed_data.json";

describe("Autocomplete Suggestions: Course", () => {
    it("should return empty array if search text is empty", () => {
        const courses: CourseSummary[] = mockData;
        expect(getAutocompleteSuggestions("", courses, "course")).toEqual([]);
    });

    it("should return empty array if no match is found", () => {
        const courses: CourseSummary[] = mockData;
        expect(getAutocompleteSuggestions("zzz", courses, "course")).toEqual(
            []
        );
    });

    it("should return suggestions for course names", () => {
        const courses: CourseSummary[] = mockData;
        const suggestions = getAutocompleteSuggestions(
            "情報セキュ",
            courses,
            "course"
        );
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions).toEqual([
            {
                text: "情報セキュリティ",
                score: expect.any(Number),
            },
            {
                text: "情報セキュリティ特論",
                score: expect.any(Number),
            },
            {
                text: "情報センシングシステム",
                score: expect.any(Number),
            },
        ]);
    });
});

describe("Autocomplete Suggestions: Teacher", () => {
    it("should return empty array if search text is empty", () => {
        const courses: CourseSummary[] = mockData;
        expect(getAutocompleteSuggestions("", courses, "teacher")).toEqual([]);
    });

    it("should return empty array if no match is found", () => {
        const courses: CourseSummary[] = mockData;
        expect(getAutocompleteSuggestions("zzz", courses, "teacher")).toEqual(
            []
        );
    });

    it("should return suggestions for teacher names", () => {
        const courses: CourseSummary[] = mockData;
        const suggestions = getAutocompleteSuggestions(
            "菅野",
            courses,
            "teacher"
        );
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions).toEqual([
            {
                text: "菅野 正嗣",
                score: expect.any(Number),
            },
            {
                text: "菅野 拓",
                score: expect.any(Number),
            },
        ]);
    });
});

describe("Autocomplete Suggestions: Campus", () => {
    it("should return empty array if search text is empty", () => {
        const courses: CourseSummary[] = mockData;
        expect(getAutocompleteSuggestions("", courses, "campus")).toEqual([]);
    });

    it("should return empty array if no match is found", () => {
        const courses: CourseSummary[] = mockData;
        expect(getAutocompleteSuggestions("zzz", courses, "campus")).toEqual(
            []
        );
    });

    it("should return suggestions for campus names", () => {
        const courses: CourseSummary[] = mockData;
        const suggestions = getAutocompleteSuggestions("中", courses, "campus");
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions).toEqual([
            {
                text: "中百舌鳥",
                score: expect.any(Number),
            },
        ]);
    });

    it("should return suggestions for campus names with diacritics", () => {
        const courses: CourseSummary[] = mockData;
        const suggestions = getAutocompleteSuggestions(
            "りん",
            courses,
            "campus"
        );
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions).toEqual([
            {
                text: "りんくう",
                score: expect.any(Number),
            },
        ]);
    });

    it("should return suggestions for campus names with diacritics", () => {
        const courses: CourseSummary[] = mockData;
        const suggestions = getAutocompleteSuggestions(
            "吉田",
            courses,
            "campus"
        );
        console.log(suggestions);
        expect(suggestions.length).toEqual(0);
    });
});
