import { map } from "nanostores";
import type { CourseSummary } from "@/types/schema";

const STORAGE_KEY = "nano-courses";
const FAV_COURSE_KEY = "fav-courses";

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
 * お気に入りコースの初期状態を取得する
 */
const getInitialFavorites = (): string[] => {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(FAV_COURSE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("[Store] Failed to load favorites");
        return [];
    }
};

// お気に入りコースのIDを保存するstore
export const favoritesStore = map<string[]>(getInitialFavorites());

if (typeof window !== "undefined") {
    favoritesStore.subscribe((state) => {
        try {
            localStorage.setItem(FAV_COURSE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error("[Store] Failed to save favorites");
        }
    });
}

/**
 * コースをお気に入りに追加する
 * @param courseId - お気に入りに追加するコースID
 */
const addFavorite = (courseId: string): void => {
    const favorites = favoritesStore.get();
    if (!favorites.includes(courseId)) {
        favoritesStore.set([...favorites, courseId]);
    }
};

/**
 * コースをお気に入りから削除する
 * @param courseId - お気に入りから削除するコースID
 */
const removeFavorite = (courseId: string): void => {
    const favorites = favoritesStore.get();
    favoritesStore.set(favorites.filter((id) => id !== courseId));
};

/**
 * コースがお気に入りかどうか確認する
 * @param courseId - 確認するコースID
 * @returns お気に入りならtrue、そうでなければfalse
 */
const isFavorite = (courseId: string): boolean => {
    return favoritesStore.get().includes(courseId);
};

/**
 * お気に入りのコースリストを取得する
 * @returns お気に入りコースのID一覧
 */
const getFavorites = (): string[] => {
    return favoritesStore.get();
};

/**
 * お気に入りをすべて削除する
 */
const clearFavorites = (): void => {
    favoritesStore.set([]);
};

/**
 * コース情報を追加する
 * @param course
 * @returns course.id
 */
const setCourse = (course: CourseSummary) => {
    try {
        const currentState = coursesMap.get();
        if (currentState[course.id]) {
            console.error(`[Store] Course ${course.id} already exists`);
            return course.id;
        } else {
            coursesMap.set({
                ...currentState,
                [course.id]: course,
            });
            return course.id;
        }
    } catch (e) {
        console.error(`[Store] Failed to add course ${course.id}`);
        return "failed";
    }
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

/**
 * コース情報をすべて削除する
 */
const clearCourses = () => {
    coursesMap.set({});
};

export {
    setCourse,
    getCourse,
    clearCourses,
    addFavorite,
    isFavorite,
    getFavorites,
};
