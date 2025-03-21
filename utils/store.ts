import { map } from "nanostores";
import type { NanoCourse } from "@/types/schema";

const STORAGE_KEY = "nano-courses";

const getInitialState = (): Record<string, NanoCourse> => {
    if (typeof window === "undefined") return {};

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error("[Store] Failed to load");
        return {};
    }
};

export const coursesMap = map<Record<string, NanoCourse>>(getInitialState());

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
 * Stores a course in the courses map using its ID as the key.
 *
 * @param course - The course object to be stored
 * @returns The ID of the stored course
 */
const setCourse = (course: NanoCourse): string => {
    coursesMap.setKey(course.id, course);
    return course.id;
};

/**
 * Retrieves a course by its ID from the courses store.
 *
 * @param id - The unique identifier of the course to retrieve
 * @returns The course object matching the provided ID
 */
const getCourse = (id: string): NanoCourse => {
    const currentState = coursesMap.get();
    return currentState[id];
};

export { setCourse, getCourse };
