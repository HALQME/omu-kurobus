import Fuse from "fuse.js";
import { normalizeText, extractTeachers, parseClassCode } from "@/utils/common";
import type { CourseEmbed, SuggestionResult } from "@/types/schema";

const getTeacherSuggestions = (
    normalizedSearchText: string,
    courses: CourseEmbed[],
    limit: number
): SuggestionResult[] => {
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
    }));
};

const getCampusSuggestions = (
    normalizedSearchText: string,
    courses: CourseEmbed[],
    limit: number
): SuggestionResult[] => {
    // キャンパスコードの一覧を取得（重複排除）
    const campus = [...new Set(courses.map((course) => course.campus))];

    const fuse = new Fuse(campus, {
        keys: ["name"],
        threshold: 0.3,
        includeScore: true,
    });

    const searchResults = fuse.search(normalizedSearchText);
    return searchResults.slice(0, limit).map((result) => ({
        text: result.item,
        score: result.score,
    }));
};

const getCourseSuggestions = (
    normalizedSearchText: string,
    courses: CourseEmbed[],
    limit: number
): SuggestionResult[] => {
    const courseNameMap = new Map<
        string,
        { course: CourseEmbed; score: number | undefined }
    >();

    const fuse = new Fuse(courses, {
        keys: ["name"],
        threshold: 0.5,
        includeScore: true,
    });

    const searchResults = fuse.search(normalizedSearchText);

    searchResults.forEach((result) => {
        courseNameMap.set(result.item.name, {
            course: result.item,
            score: result.score,
        });
    });

    return Array.from(courseNameMap.values())
        .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
        .slice(0, limit)
        .map(({ course, score }) => ({
            text: course.name,
            score: score,
        }));
};

export const getAutocompleteSuggestions = (
    searchText: string,
    courses: CourseEmbed[],
    field: "course" | "teacher" | "campus",
    limit = 5
): SuggestionResult[] => {
    if (!searchText.trim()) return [];

    const normalizedSearchText = normalizeText(searchText);

    switch (field) {
        case "teacher":
            return getTeacherSuggestions(normalizedSearchText, courses, limit);
        case "campus":
            return getCampusSuggestions(normalizedSearchText, courses, limit);
        case "course":
        default:
            return getCourseSuggestions(normalizedSearchText, courses, limit);
    }
};
