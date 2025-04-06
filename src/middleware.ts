// This helper automatically types middleware params
import { defineMiddleware } from "astro:middleware";
import { PATH_PAIRS } from "@/utils/const";
export const onRequest = defineMiddleware(async (context, next) => {
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



    return next();
});

// 入力期間内かどうかを確認する関数
function isWithinSubmissionPeriod(): boolean {
    return PATH_PAIRS().some((pair) => pair.type === "submit");
}
