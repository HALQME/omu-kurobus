import type { APIRoute } from "astro";
import { type ResponseData } from "@/types/schema";
import { AVAILABLE_PAIRS } from "@/utils/const";
import fetch from "node-fetch";
import https from "node:https";
import { generateMockData } from "./_mock";
export const prerender = true;

// 証明書検証をスキップするHTTPSエージェントを作成
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

export function getStaticPaths() {
    const availableYears = AVAILABLE_PAIRS();
    return availableYears.map(({ type, path }) => ({
        params: { year: path.year, semester: path.semester, type },
    }));
}

// モックデータを生成する関数

export const GET: APIRoute = async ({ params }) => {
    const { year, semester } = params;

    // 環境変数でモックAPIを使用するかどうかを判断
    const useMockApi = process.env.USE_MOCK_API === "true";

    let data: ResponseData;

    if (useMockApi) {
        // モックデータを使用
        console.log(`Using mock data`);
        data = generateMockData();
    } else {
        // 実際のAPIを呼び出し
        const res = await fetch(
            `https://catalog.sp.omu.ac.jp/api/search.json?year=${year}&semesters=${semester}`,
            {
                agent: httpsAgent,
            }
        );
        data = (await res.json()) as ResponseData;
    }

    if (data.code !== 200) {
        return new Response(data.msg, { status: 500 });
    }

    return new Response(JSON.stringify(data.data, null, 2), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
};
