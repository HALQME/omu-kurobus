import type { APIRoute } from "astro";
import { type Course, type CourseEmbed } from "@/types/schema";
import { AVAILABLE_PAIRS } from "@/utils/const";
import fetch from "node-fetch";
import MockData from "test/_embed_data.json";
export const prerender = true;

export function getStaticPaths() {
    const availableYears = AVAILABLE_PAIRS();
    return availableYears.map(({ type, path }) => ({
        params: { year: path.year, semester: path.semester, type },
    }));
}

export const GET: APIRoute = async ({ params }) => {
    const { year, semester } = params;

    // 環境変数でモックAPIを使用するかどうかを判断
    const useMockApi = process.env.USE_MOCK_API === "true";

    let data;

    if (useMockApi) {
        // モックデータを使用
        console.log(`Using mock data`);
        data = MockData;
    } else {
        data = await fetchData(year!, semester!).then(embeddedData);
    }

    return new Response(JSON.stringify(data, null, 2), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
};

const fetchData = async (year: string, semester: string) => {
    const res = await fetch(
        `https://raw.githubusercontent.com/HALQME/omu-course-library/refs/heads/main/${year}/${semester}/data.json`
    );
    return res.json() as unknown as Course[];
};

const embeddedData = (data: Course[]): CourseEmbed[] => {
    return data.map((course) => {
        return {
            id: course.id,
            name: course.name,
            teachers: course.teachers,
            campus: course.campus,
        };
    });
};