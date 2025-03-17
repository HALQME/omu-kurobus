import { CAMPUS_NAME } from "@/utils/const";
import Fuse from "fuse.js";
import { normalizeText, extractTeachers, parseClassCode } from "@/utils/common";
import { type Course } from "@/types/schema";

interface SuggestionResult {
    text: string;
    score: number | undefined;
    details?: {
        teachers?: string;
        campus?: string;
        classCode?: string;
    };
}


export const getAutocompleteSuggestions = (
    searchText: string,
    courses: Course[],
    field: "course" | "teacher",
    limit = 5
): SuggestionResult[] => {
    if (!searchText.trim()) return [];

    const normalizedSearchText = normalizeText(searchText);

    if (field === "teacher") {
        const teacherMap = new Map<
            string,
            {
                courses: Set<string>;
                campuses: Set<string>;
                classCodes: Set<string>;
            }
        >();

        courses.forEach((course) => {
            const teachers = extractTeachers(course.teachers);
            teachers.forEach((teacher) => {
                if (!teacherMap.has(teacher)) {
                    teacherMap.set(teacher, {
                        courses: new Set(),
                        campuses: new Set(),
                        classCodes: new Set(),
                    });
                }
                const teacherInfo = teacherMap.get(teacher)!;
                teacherInfo.courses.add(course.name);
                teacherInfo.campuses.add(course.campus);
                teacherInfo.classCodes.add(parseClassCode(course.id));
            });
        });

        const teacherArray = Array.from(teacherMap.entries());
        const fuse = new Fuse(teacherArray, {
            keys: ["0"],
            threshold: 0.3,
            includeScore: true,
        });

        const searchResults = fuse.search(normalizedSearchText);
        return searchResults.slice(0, limit).map((result) => ({
            text: result.item[0],
            score: result.score,
            details: {
                campus: Array.from(result.item[1].campuses)
                    .map(CAMPUS_NAME)
                    .join("・"),
                classCode: Array.from(result.item[1].classCodes).join("・"),
            },
        }));
    } else {
        const courseNameMap = new Map<
            string,
            { course: Course; score: number | undefined }
        >();

        const fuse = new Fuse(courses, {
            keys: ["name"],
            threshold: 0.3,
            includeScore: true,
        });

        const searchResults = fuse.search(normalizedSearchText);

        searchResults.forEach((result) => {
            const normalizedName = normalizeText(result.item.name);

            if (courseNameMap.has(normalizedName)) {
                const existing = courseNameMap.get(normalizedName)!;
                if ((result.score ?? 1) < (existing.score ?? 1)) {
                    courseNameMap.set(normalizedName, {
                        course: result.item,
                        score: result.score,
                    });
                }
            } else {
                courseNameMap.set(normalizedName, {
                    course: result.item,
                    score: result.score,
                });
            }
        });

        return Array.from(courseNameMap.values())
            .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
            .slice(0, limit)
            .map(({ course, score }) => ({
                text: course.name,
                score: score,
                details: {
                    teachers: course.teachers,
                    campus: CAMPUS_NAME(course.campus),
                    classCode: parseClassCode(course.id),
                },
            }));
    }
};
