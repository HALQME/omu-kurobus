import Fuse from "fuse.js";
import {
    type SearchQuery,
    type Course,
    type SearchResult,
} from "@/types/schema";
import { encode } from "./search-engine";

const fuseOptions = {
    keys: [
        {
            name: "name",
            weight: 0.75,
            getFn: (obj: Course) => encode(obj.name),
        },
        {
            name: "teachers",
            weight: 0.75,
            getFn: (obj: Course) => encode(obj.teachers),
        },
        {
            name: "id",
            weight: 0.5,
        },
        {
            name: "campus",
            weight: 0.5,
            getFn: (obj: Course) => encode(obj.campus),
        },
    ],
    threshold: 0.3, // より厳密なマッチング
    includeScore: true,
    ignoreLocation: true,
    ignoreFieldNorm: true,
    useExtendedSearch: true,
    shouldSort: true,
    findAllMatches: true,
    minMatchCharLength: 2, // 最小マッチ文字数
    distance: 100, // より柔軟な文字距離
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
        andQuery.push({ name: encode(query.course) });
    }
    if (query.teacher) {
        andQuery.push({ teachers: encode(query.teacher) });
    }
    if (query.class_code) {
        andQuery.push({ id: "^" + query.year + query.class_code });
    }
    if (query.campus) {
        andQuery.push({ campus: encode(query.campus) });
    }

    fuseQuery = {
        $and: andQuery,
    };
    let results = fuse.search(fuseQuery);

    const parsedResults = results
        .map((result) => {
            return {
                ...result.item,
                score: result.score,
            };
        })
        .filter((result) => result.score !== null)
        .filter((result) => result.score! <= 0.85)
        .sort((a, b) => a.score! - b.score!);

    return parsedResults;
}
