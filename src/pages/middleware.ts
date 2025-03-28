// This helper automatically types middleware params
import { defineMiddleware } from "astro:middleware";

import { PATH_PAIRS } from "@/utils/const";

export const onRequest = defineMiddleware(({ request }, next) => {
    // 入力期間内かどうかチェック
    const isSubmissionPeriod = isWithinSubmissionPeriod();

    // URLパスを取得
    const url = new URL(request.url);
    const path = url.pathname;

    // 入力期間外で、かつパスが/submit/で始まる場合
    if (!isSubmissionPeriod && path.startsWith("/submit/")) {
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
