import type { APIRoute } from "astro";
import { type Course, type CourseEmbed } from "@/types/schema";
import { PATH_PAIRS } from "@/utils/const";
import fetch from "node-fetch";
import MockData from "test/_embed_data.json";

export function getStaticPaths() {
    const availableYears = PATH_PAIRS();
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
        data = await fetchData(year!, semester!).then((data) =>
            embeddedData(data, year!, semester!)
        );
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
        `https://raw.githubusercontent.com/HALQME/omu-course-library/refs/heads/main/data/${year}/${semester}/data.json`
    );
    return res.json() as unknown as Course[];
};

const embeddedData = (
    data: Course[],
    year: string,
    semester: string
): CourseEmbed[] => {
    const semesterValue = year + "年度" + (semester === "1" ? "前期" : "後期");
    const courseEmbeds: CourseEmbed[] = data.map((course) => {
        const courseEmbed: CourseEmbed = {
            id: course.id,
            name: course.name,
            teachers: course.teachers,
            campus: course.campus,
            semester:
                course.semester === semesterValue ? semesterValue : undefined,
            period: course.period,
        };
        return courseEmbed;
    });
    return courseEmbeds;
};