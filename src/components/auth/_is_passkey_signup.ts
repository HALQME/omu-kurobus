import { db } from "@/utils/db";

/**
 * ユーザーがパスキーでサインアップ済みかどうかを確認する関数
 * @param userId - 確認対象のユーザーID
 * @returns パスキーサインアップ済みの場合はtrue、そうでない場合はfalse
 */
export async function isPasskeySignup(userId: string): Promise<boolean> {
    if (!userId) return false;

    try {
        // パスキーテーブルからユーザーのレコードを検索
        const passkey = await db.query.passkey.findFirst({
            where: (passkey, { eq }) => eq(passkey.userId, userId),
        });

        // パスキーレコードが存在すればtrueを返す
        return !!passkey;
    } catch (error) {
        console.error("パスキー確認中にエラーが発生しました:", error);
        return false;
    }
}

/**
 * ユーザーのパスキー数を取得する関数
 * @param userId - 確認対象のユーザーID
 * @returns ユーザーに紐づけられたパスキーの数
 */
export async function getPasskeyCount(userId: string): Promise<number> {
    if (!userId) return 0;

    try {
        const passkeys = await db.query.passkey.findMany({
            where: (passkey, { eq }) => eq(passkey.userId, userId),
        });

        return passkeys.length;
    } catch (error) {
        console.error("パスキー数取得中にエラーが発生しました:", error);
        return 0;
    }
}
