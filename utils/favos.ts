import { db } from "./db";
import { favCourses } from "db/schema";
import { eq } from "drizzle-orm";
import { addFavorite, clearFavorites, getFavorites } from "./store";

export async function getFavCourses(userId: string): Promise<string[]> {
    try {
        const rows = await db
            .select()
            .from(favCourses)
            .where(eq(favCourses.userId, userId))
            .execute();

        if (rows.length === 0) {
            return [];
        }

        const courseIds = JSON.parse(rows[0]?.courseId) as string[];
        return courseIds;
    } catch (error) {
        console.error("Error fetching favorite courses:", error);
        throw error;
    }
}

export async function addFavCourse(userId: string, courseId: string) {
    try {
        const rows = await db
            .select()
            .from(favCourses)
            .where(eq(favCourses.userId, userId))
            .execute();

        if (rows.length === 0) {
            // 新規ユーザーの場合、配列に単一の要素を追加
            await db.insert(favCourses).values({
                userId,
                courseId: JSON.stringify([courseId]),
            });
        } else {
            // 既存ユーザーの場合、配列に追加
            const courseIds = JSON.parse(rows[0]?.courseId) as string[];
            if (!courseIds.includes(courseId)) {
                courseIds.push(courseId);
                await db
                    .update(favCourses)
                    .set({
                        courseId: JSON.stringify(courseIds),
                    })
                    .where(eq(favCourses.userId, userId))
                    .execute();
            }
        }
    } catch (error) {
        console.error("Error adding favorite course:", error);
        throw error;
    }
}

export async function setFavCourses(userId: string, courseIds: string[]) {
    try {
        const rows = await db
            .select()
            .from(favCourses)
            .where(eq(favCourses.userId, userId))
            .execute();
        if (rows.length === 0) {
            await db.insert(favCourses).values({
                userId,
                courseId: JSON.stringify(courseIds),
            });
        } else {
            await db
                .update(favCourses)
                .set({
                    courseId: JSON.stringify(courseIds),
                })
                .where(eq(favCourses.userId, userId))
                .execute();
        }
    } catch (error) {
        console.error("Error setting favorite courses:", error);
        throw error;
    }
}

export async function removeFavCourse(userId: string, courseId: string) {
    try {
        const rows = await db
            .select()
            .from(favCourses)
            .where(eq(favCourses.userId, userId))
            .execute();

        if (rows.length === 0) {
            return;
        }

        const courseIds = JSON.parse(rows[0]?.courseId) as string[];
        const updatedCourses = courseIds.filter((id) => id !== courseId);

        await db
            .update(favCourses)
            .set({ courseId: JSON.stringify(updatedCourses) })
            .where(eq(favCourses.userId, userId))
            .execute();
        return;
    } catch (error) {
        console.error("Error removing favorite course:", error);
        throw error;
    }
}

export async function syncFavorites(userId: string): Promise<string[]> {
    const DBfavCourses: string[] = await getFavCourses(userId);
    const LocalfavCourse: string[] = getFavorites();

    const dbSet = new Set(DBfavCourses.map((courseId) => courseId));
    const localSet = new Set(LocalfavCourse.map((courseId) => courseId));

    const favorites = Array.from(new Set([...dbSet, ...localSet]));

    clearFavorites();
    favorites.forEach((courseId) => {
        addFavorite(courseId);
    });

    return favorites;
}
