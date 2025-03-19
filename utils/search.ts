import Fuse from "fuse.js";
import {
    type SearchQuery,
    type Course,
    type SearchResult,
} from "@/types/schema";

const fuseOptions = {
    keys: [
        {
            name: "name",
            weight: 0.75,
        },
        {
            name: "teachers",
            weight: 0.75,
        },
        {
            name: "id",
            weight: 0.5,
        },
        {
            name: "campus",
            weight: 0.5,
        },
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    ignoreFieldNorm: true,
    useExtendedSearch: true,
    shouldSort: true,
    findAllMatches: true,
};

export async function search(
    query: SearchQuery,
    courses: Course[]
): Promise<SearchResult[]> {
    const fuse = new Fuse(courses, fuseOptions);

    if (!query.campus && !query.course && !query.teacher && !query.class_code) {
        return [];
    }

    let fuseQuery = {};

    let andQuery = [];

    if (query.course) {
        andQuery.push({ name: query.course });
    }
    if (query.teacher) {
        andQuery.push({ teachers: "'" + query.teacher });
    }
    if (query.class_code) {
        andQuery.push({ id: "'" + query.class_code });
    }
    if (query.campus) {
        andQuery.push({ campus: "'" + query.campus });
    }

    fuseQuery = {
        $and: andQuery,
    };
    let results = fuse.search(fuseQuery);

    const parsedResults = results
        .map((result) => ({
            name: result.item.name,
            code: result.item.id,
            score: result.score,
            teachers: result.item.teachers,
            campus: result.item.campus,
            semester: result.item.semester,
            period: result.item.period,
        }))
        .filter((result) => result.score !== null)
        .filter((result) => result.score! <= 0.85)
        .sort((a, b) => a.score! - b.score!);

    return parsedResults;
}