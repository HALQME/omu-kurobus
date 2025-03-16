import Fuse from "fuse.js";
import {
    type SearchQuery,
    type Course,
    type SearchResult,
} from "@/types/schema";
import { CAMPUS_NAME } from "./const";

const fuseOptions = {
    keys: [
        {
            name: "name",
            weight: 0.6,
        },
        {
            name: "teachers",
            weight: 0.3,
        },
        {
            name: "id",
            weight: 0.1,
        },
        {
            name: "campus",
            weight: 0.3,
        },
        {
            name: "semester",
            weight: 0.1,
        },
    ],
    threshold: 0.3,
    includeScore: true,
    ignoreLocation: true,
    useExtendedSearch: true,
};

export async function search(
    query: SearchQuery,
    courses: Course[]
): Promise<SearchResult[]> {
    const fuse = new Fuse(courses, fuseOptions);
    let results = fuse.search({
        $or: [
            {
                $and: [
                    {
                        name: query.course ?? "",
                    },
                    {
                        teachers: query.teacher ?? "",
                    },
                    {
                        id: query.class_code ?? "",
                    },
                    {
                        semester: query.semester ?? "",
                    },
                ],
            },
            {
                $or: [
                    {
                        campus: CAMPUS_NAME(query.campus?.[0]) ?? "",
                    },
                    {
                        campus: CAMPUS_NAME(query.campus?.[1]) ?? "",
                    },
                    {
                        campus: CAMPUS_NAME(query.campus?.[2]) ?? "",
                    },
                    {
                        campus: CAMPUS_NAME(query.campus?.[3]) ?? "",
                    },
                ],
            },
        ],
    });

    // Sort results by relevance
    if (query.course?.trim() || query.teacher?.trim()) {
    } else {
        // テキスト検索がない場合は、名前でソート
        results.sort((a, b) => a.item.name.localeCompare(b.item.name, "ja"));
    }

    console.log("Final results count:", results.length);
    const parsedResults = results.map((result) => ({
        name: result.item.name,
        code: result.item.id,
        score: result.score,
        teachers: result.item.teachers,
        campus: result.item.campus,
        semester: result.item.semester,
        period: result.item.period,
    }));

    return parsedResults;
}
