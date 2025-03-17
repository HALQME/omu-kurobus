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
            weight: 0.6,
        },
        {
            name: "campus",
            weight: 0.6,
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
    let fuseQuery = {};

    const baseConditions = [
        {
            name: query.course ?? "",
        },
        {
            teachers: query.teacher ?? "",
        },
    ];

    if (query.campus && query.class_code) {
        fuseQuery = {
            $and: [
                {
                    $or: baseConditions,
                },
                {
                    campus: query.campus,
                },
                {
                    id: query.class_code,
                },
            ],
        };
    } else if (query.campus) {
        fuseQuery = {
            $and: [
                {
                    $or: baseConditions,
                },
                {
                    campus: query.campus,
                },
            ],
        };
    } else {
        fuseQuery = {
            $or: baseConditions,
        };
    }
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
        .filter(
            (v, i, arr) => arr.findIndex((item) => item.code === v.code) === i
        )
        .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));

    return parsedResults;
}