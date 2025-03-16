import type { APIRoute } from "astro";
import { z } from "zod";
import { CourseSchema } from "@/types/schema";
import { AVAILABLE_PAIRS } from "@/utils/const";
import fetch from "node-fetch";
import https from "node:https";
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

export const GET: APIRoute = async ({ params }) => {
    const { year, semester } = params;
    const res = await fetch(
        `https://catalog.sp.omu.ac.jp/api/search.json?year=${year}&semesters=${semester}`,
        {
            agent: httpsAgent,
        }
    );
    const data = (await res.json()) as ResponseData;
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

const ResponseSchema = z.object({
    code: z.number(),
    msg: z.string(),
    data: z.array(CourseSchema),
});

type ResponseData = z.infer<typeof ResponseSchema>;
