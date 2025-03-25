import Fuse from "fuse.js";
import type { CourseSummary, CourseReviewRecord } from "@/types/schema";
import { encode } from "./search-engine";
import { PATH_PAIRS } from "./const";
import { use } from "react";

const fuseOptions = {
    keys: [
        {
            name: "name",
            weight: 0.75,
        },
        {
            name: "teachers",
            weight: 0.4,
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
    threshold: 0.8,
    includeScore: true,
    shouldSort: true,
    useExtendedSearch: true,
};

async function fetchCourses(
    year: string,
    semester: string
): Promise<CourseSummary[]> {
    // 現在のURLを取得
    const url = `${
        import.meta.env.DEV ? "http://localhost:3000" : import.meta.env.SITE
    }/api/courses/${year}/${semester}/data.json`;
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Failed to fetch courses for ${year} ${semester}`);
    }
    return res.json();
}

export async function similars(
    course: CourseSummary
): Promise<{ year: string; semester: string; courses: CourseSummary[] }[]> {
    // 重複を排除した年度のリストを取得
    const years = [
        ...new Set(
            PATH_PAIRS()
                .map(({ path }) => path.year)
                .filter((year) => year < new Date().getFullYear().toString())
        ),
    ];
    const semester = course.semester?.endsWith("前期") ? "0" : "1";
    const similarCoursesByYear: {
        year: string;
        semester: string;
        courses: CourseSummary[];
    }[] = [];

    for (const year of years) {
        try {
            const courses = await fetchCourses(year, semester);
            const fuse = new Fuse(courses, fuseOptions);
            const query = {
                name: "'" + course.name,
                teachers: course.teachers,
                id: course.id.slice(4),
                campus: course.campus,
            };
            const results = fuse.search(query);

            // この年度の類似コースを取得（自分自身は除外）
            const similarCourses = results.map((result) => result.item);

            // コースが見つかった場合のみ追加
            if (similarCourses.length > 0) {
                // この年度の類似コースから重複を排除
                const uniqueCoursesMap = new Map<string, CourseSummary>();
                similarCourses.forEach((course) => {
                    const key = `${course.id}-${course.name}-${course.teachers}`;
                    uniqueCoursesMap.set(key, course);
                });

                similarCoursesByYear.push({
                    year,
                    semester,
                    courses: Array.from(uniqueCoursesMap.values()),
                });
            }
        } catch (error) {
            console.error(
                `Failed to fetch courses for ${year} ${semester}:`,
                error
            );
        }
    }

    // 年度の新しい順にソート
    return similarCoursesByYear.sort((a, b) => Number(b.year) - Number(a.year));
}
