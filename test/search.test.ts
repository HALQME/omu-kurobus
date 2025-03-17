import { describe, expect, it } from "vitest";
import type { Course, SearchQuery } from "@/types/schema";
import { search } from "@/utils/search";
import { generateMockData } from "@/utils/_mock";

const mockData = generateMockData();

describe("Search Queries", () => {
    const courses = mockData.data;
    it("normal search", async () => {
        const query: SearchQuery = {
            semester: "1",
            year: "2023",
            course: "プログラミング 化工",
        };
        const searchResults = await search(query, courses);
        expect(searchResults[0].name).toEqual(
            "プログラミング入門A /必:工<化工・マテ>N"
        );
    });

    it("searches by teacher name", async () => {
        const query: SearchQuery = {
            teacher: "山田",
            year: "2023",
            semester: "1",
        };
        const searchResults = await search(query, courses);
        expect(
            searchResults.some(
                (result) => result.teachers && result.teachers.includes("山田")
            )
        ).toBeTruthy();
    });

    it("searches by campus", async () => {
        const query: SearchQuery = {
            campus: "杉本",
            year: "2023",
            semester: "1",
        };
        const searchResults = await search(query, courses);
        expect(
            searchResults.every((result) => result.campus === "杉本")
        ).toBeTruthy();
    });
    it("returns unique results", async () => {
        const query: SearchQuery = {
            course: "情報",
            year: "2023",
            semester: "1",
        };
        const searchResults = await search(query, courses);
        const codes = searchResults.map((result) => result.code);
        const uniqueCodes = [...new Set(codes)];
        expect(codes.length).toEqual(uniqueCodes.length);
    });

    it("sorts results by score", async () => {
        const query: SearchQuery = {
            course: "物理",
            semester: "1",
            year: "2023",
        };
        const searchResults = await search(query, courses);
        for (let i = 0; i < searchResults.length - 1; i++) {
            expect(searchResults[i].score).toBeLessThanOrEqual(
                searchResults[i + 1].score || 1
            );
        }
    });
});
