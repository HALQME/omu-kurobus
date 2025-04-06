// This helper automatically types middleware params
import { auth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";

import { PATH_PAIRS } from "@/utils/const";

export const onRequest = defineMiddleware((context, next) => {
    // URLパスを取得
    const url = new URL(context.request.url);
    const path = url.pathname;

    if (path.startsWith("/api/courses")) {
        return next();
    }

    // 入力期間外で、かつパスが/submit/で始まる場合
    const isSubmissionPeriod = isWithinSubmissionPeriod();
    if (!isSubmissionPeriod && path.startsWith("/submit")) {
        // ルートにリダイレクト
        return new Response("", {
            status: 302,
            headers: {
                Location: "/",
            },
        });
    }

    const isAuthed = getAuthSession(context);

    isAuthed.then((authSession) => {
        if (authSession) {
            context.locals.user = authSession.user;
            context.locals.session = authSession.session;
        } else {
            context.locals.user = null;
            context.locals.session = null;
        }
    });

    return next();
});

// 入力期間内かどうかを確認する関数
function isWithinSubmissionPeriod(): boolean {
    return PATH_PAIRS().some((pair) => pair.type === "submit");
}

async function getAuthSession(context: any) {
    return auth.api.getSession({
        headers: context.request.headers,
    });
}