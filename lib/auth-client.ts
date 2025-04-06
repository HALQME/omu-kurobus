import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";
import { multiSessionClient } from "better-auth/client/plugins";
import { passkeyClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [anonymousClient(), passkeyClient()],
    advanced: {
        useSecureCookies: true,
        defaultCookieAttributes: {
            httpOnly: true,
            secure: import.meta.env.PROD,
            maxAge: 30 * 24 * 60 * 60, // 30日間
            sameSite: "lax",
        },
        csrfProtection: true, // CSRF保護を有効化
    },
});

// 認証状態を取得するためのヘルパー関数
export const getAuthStatus = async () => {
    try {
        const { data: session } = await authClient.getSession();
        return {
            isAuthenticated: !!session?.user,
            isAnonymous: session?.user?.isAnonymous === true,
            user: session?.user || null,
            sessionId: session?.session?.id || null,
        };
    } catch (error) {
        console.error("認証状態の取得に失敗:", error);
        return { isAuthenticated: false, isAnonymous: false, user: null };
    }
};
