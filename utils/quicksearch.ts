import Fuse from "fuse.js";
import type { CourseEmbed, QuickSearchResult } from "@/types/schema";

export const quickSearch = (
    normalizedSearchText: string,
    courses: CourseEmbed[]
): QuickSearchResult[] => {
    const fuse = new Fuse(courses, {
        keys: [
            {
                name: "name",
                weight: 0.75,
            },
            {
                name: "teachers",
                weight: 0.6,
            },
            {
                name: "id",
                weight: 0.3,
            },
            {
                name: "campus",
                weight: 0.2,
            },
        ],
        threshold: 0.4,
        includeScore: true,
        shouldSort: true,
    });

    const searchResults = fuse.search(normalizedSearchText);

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
