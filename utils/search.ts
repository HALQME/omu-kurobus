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
            name: "semester",
            weight: 0.1,
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
    let fuseQuery = {};

    const baseConditions = [
        {
            name: query.course ?? "",
        },
        {
            teachers: query.teacher ?? "",
        },
    ];

    fuseQuery = {
        $or: baseConditions,
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
        .filter((result) => result.campus.includes(query.campus ?? ""))
        .filter((result) => result.code.includes(query.class_code ?? ""));

    return parsedResults;
}