import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../utils/db";
import { eq } from "drizzle-orm";
import { favCourses } from "db/schema";
import { anonymous } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

const rpName = "ハム大クロバス";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
    plugins: [
        passkey({
            rpName: rpName,
            authenticatorSelection: {
                residentKey: "required",
                userVerification: "required",
            },
        }),
        anonymous({
            emailDomainName: "anonymous.omu-kurobus.app",
            onLinkAccount: async ({
                anonymousUser,
                newUser,
            }: {
                anonymousUser: { user?: { id: string } } | null;
                newUser: { user?: { id: string } } | null;
            }) => {
                if (!anonymousUser?.user || !newUser?.user) {
                    return;
                }
                const anonymousId = anonymousUser.user.id;
                const newUserId = newUser.user.id;
                try {
                    await db.transaction(async (tx) => {
                        const { rowsAffected } = await tx
                            .update(favCourses)
                            .set({ userId: newUserId })
                            .where(eq(favCourses.userId, anonymousId));
                        console.log(
                            `移行されたお気に入りデータ: ${rowsAffected}件`
                        );
                    });
                } catch (error) {
                    if (error instanceof Error) {
                        console.error(
                            "データ移行中にエラーが発生しました:",
                            error.message
                        );
                    } else {
                        console.error(
                            "データ移行中にエラーが発生しました:",
                            error
                        );
                    }
                }
            },
        }),
    ],
    session: {
        expiresIn: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
        strategy: "database",
    },
    advanced: {
        useSecureCookies: import.meta.env.PROD,
        defaultCookieAttributes: {
            httpOnly: true,
            secure: import.meta.env.PROD,
            maxAge: 30 * 24 * 60 * 60,
            sameSite: "lax",
        },
        csrfProtection: true,
    },
});
