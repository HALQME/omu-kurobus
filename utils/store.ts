import { map } from "nanostores";
import type { CourseSummary } from "@/types/schema";

const STORAGE_KEY = "nano-courses";

const getInitialState = (): Record<string, CourseSummary> => {
    if (typeof window === "undefined") return {};

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error("[Store] Failed to load");
        return {};
    }
};

export const coursesMap = map<Record<string, CourseSummary>>(getInitialState());

if (typeof window !== "undefined") {
    coursesMap.subscribe((state) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error("[Store] Failed to save");
        }
    });
}

/**
 * コース情報を追加する
 * @param course
 * @returns course.id
 */
const setCourse = (course: CourseSummary): string => {
    coursesMap.setKey(course.id, course);
    return course.id;
};

/**
 * コース情報を取得する
 * @param id - コースID
 * @returns コース情報
 */
const getCourse = (id: string): CourseSummary => {
    const currentState = coursesMap.get();
    return currentState[id];
};

export { setCourse, getCourse };
