import Fuse from "fuse.js";
import type { CourseSummary, CourseReviewRecord } from "@/types/schema";
import { encode } from "./search-engine";

const fuseOptions = {
    keys: [
        {
            name: "name",
            weight: 0.75,
            getFn: (obj: CourseSummary) => encode(obj.name),
        },
        {
            name: "teachers",
            weight: 0.75,
            getFn: (obj: CourseSummary) => encode(obj.teachers),
        },
        {
            name: "id",
            weight: 0.5,
        },
        {
            name: "campus",
            weight: 0.5,
            getFn: (obj: CourseSummary) => encode(obj.campus),
        },
    ],
    threshold: 0.3,
    includeScore: true,
    shouldSort: true,
    findAllMatches: true,
};

async function fetchCourses(
    year: string,
    semester: string
): Promise<CourseSummary[]> {
    const url = `/api/courses/${year}/${semester}/data.json`;
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Failed to fetch courses for ${year} ${semester}`);
    }
    return res.json();
}

export async function similars(
    course: CourseSummary
): Promise<{ year: string; semester: string; courses: CourseSummary[] }[]> {
    const currentYear = new Date().getFullYear();
    const years = [
        String(currentYear - 1),
        String(currentYear),
        String(currentYear + 1),
    ];
    const semesters = ["前期", "後期"];
    const similarCoursesByYear = [];

    for (const year of years) {
        for (const semester of semesters) {
            try {
                const courses = await fetchCourses(year, semester);
                const fuse = new Fuse(courses, fuseOptions);
                const results = fuse.search(course);
                const similarCourses = results
                    .map((result) => result.item)
                    .filter((similarCourse) => similarCourse.id !== course.id); // 同じIDのコースは除外

                if (similarCourses.length > 0) {
                    similarCoursesByYear.push({
                        year,
                        semester,
                        courses: similarCourses,
                    });
                }
            } catch (error) {
                console.error(
                    `Failed to fetch courses for ${year} ${semester}:`,
                    error
                );
            }
        }
    }

    return similarCoursesByYear;
}
