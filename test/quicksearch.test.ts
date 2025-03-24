import { describe, test, expect, vi, beforeEach, it } from "vitest";
import { quickSearch } from "@/utils/quicksearch";
import type { CourseSummary, CourseSearchResult } from "@/types/schema";

import mockData from "test/_embed_data.json";
const courses: CourseSummary[] = mockData;

describe("quickSearch", () => {
    it("normal search", async () => {
        const query = "プログラミング 電シス";
        const searchResults = quickSearch(query, courses);
        expect(searchResults[0].name).toEqual(
            "プログラミング入門A /必:工<電ｼｽ>N"
        );
    });

    it("searches by teacher name", async () => {
        const query = "山田";
        const searchResults = quickSearch(query, courses);
        expect(
            searchResults.some(
                (result) => result.teachers && result.teachers.includes("山田")
            )
        ).toBeTruthy();
    });

    it("searches by campus", async () => {
        const query = "杉本";
        const searchResults = quickSearch(query, courses);
        expect(searchResults.some((result) => result.campus === "杉本"))
            .toBeTruthy;
    });

    it("returns unique results", async () => {
        const query = "情報";
        const searchResults = quickSearch(query, courses);
        const codes = searchResults.map((result) => result.id);
        const uniqueCodes = [...new Set(codes)];
        expect(codes.length).toEqual(uniqueCodes.length);
    });
});
