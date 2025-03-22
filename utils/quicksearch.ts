import Fuse from "fuse.js";
import type { CourseEmbed, QuickSearchResult } from "@/types/schema";
import { encode } from "./search-engine";

export const quickSearch = (
    query: string,
    courses: CourseEmbed[]
): QuickSearchResult[] => {
    const fuse = new Fuse(courses, {
        keys: [
            {
                name: "name",
                weight: 0.75,
                getFn: (obj: CourseEmbed) => encode(obj.name),
            },
            {
                name: "teachers",
                weight: 0.6,
                getFn: (obj: CourseEmbed) => encode(obj.teachers),
            },
            {
                name: "id",
                weight: 0.3,
                getFn: (obj: CourseEmbed) => encode(obj.id),
            },
            {
                name: "campus",
                weight: 0.2,
                getFn: (obj: CourseEmbed) => encode(obj.campus),
            },
            {
                name: "semester",
                weight: 0.1,
                getFn: (obj: CourseEmbed) => encode(obj.semester ?? ""),
            },
        ],
        threshold: 0.3,
        includeScore: true,
        shouldSort: true,
        useExtendedSearch: true,
        findAllMatches: true,
    });

    const searchResults = fuse.search(encode(query));

    if (searchResults.length === 0) {
        console.log("No search results found");
        return [];
    }

    const results: QuickSearchResult[] = searchResults.map((result) => ({
        id: result.item.id,
        name: result.item.name,
        teachers: result.item.teachers,
        campus: result.item.campus,
        score: result.score,
        semester: result.item.semester,
        period: result.item.period,
    }));

    return results;
};
