import { db } from "@/utils/db";
import { eq, is } from "drizzle-orm";
import { user, favCourses } from "db/schema";
import { actions } from "astro:actions";

export async function migrateAccount(
    prev: string,
    curr: string
): Promise<void> {
    try {
        await db.transaction(async (tx) => {
            // 過去ユーザーのお気に入りコースを取得
            const previRows = await tx
                .select()
                .from(favCourses)
                .where(eq(favCourses.userId, prev))
                .execute();

            // 現在ユーザーのお気に入りコースを取得
            const currentRows = await tx
                .select()
                .from(favCourses)
                .where(eq(favCourses.userId, curr))
                .execute();

            // それぞれのお気に入りコースのJSONをパースして、Setを作成
            const prevLists = JSON.parse(previRows[0]?.courseId) as string[];
            const currentLists = JSON.parse(
                currentRows[0]?.courseId
            ) as string[];

            for (const courseId of prevLists) {
                const formData = new FormData();
                formData.append("course_id", courseId);
                await actions.course.removeFavorite(formData);
            }

            // 新しいユーザーのお気に入りコースをセットに追加
            const newLists = new Set([...prevLists, ...currentLists]);

            // 新しいユーザーのお気に入りコースをJSONに変換
            const newCourseId = JSON.stringify(Array.from(newLists));

            // お気に入りコースを更新
            await tx
                .update(favCourses)
                .set({ courseId: newCourseId })
                .where(eq(favCourses.userId, curr))
                .execute();

            await tx
                .update(user)
                .set({ isAnonymous: false })
                .where(eq(user.id, curr))
                .execute();

            // 過去ユーザーを削除
            await tx.delete(user).where(eq(user.id, prev)).execute();
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("データ移行中にエラーが発生しました:", error.message);
        } else {
            console.error("データ移行中にエラーが発生しました:", error);
        }
    }
}
