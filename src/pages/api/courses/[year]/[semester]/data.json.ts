import type { APIRoute } from "astro";
import { type Course, type CourseSummary } from "@/types/schema";
import { PATH_PAIRS } from "@/utils/const";
import fetch from "node-fetch";

export function getStaticPaths() {
    const availableYears = PATH_PAIRS();
    return availableYears.map(({ type, path }) => ({
        params: { year: path.year, semester: path.semester, type },
    }));
}

export const GET: APIRoute = async ({ params }) => {
    const { year, semester } = params;

    let data;

    data = await fetchData(year!, semester!).then((data) =>
        summaryData(data, year!, semester!)
    );

    return new Response(JSON.stringify(data, null, 2), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
};

import Mock_251 from "test/_row_data_25_1.json";
import Mock_241 from "test/_row_data_24_1.json";

const Mock = (year: string, semester: string) => {
    if (year == "2025" && semester == "1") return Mock_251;
    if (year == "2024" && semester == "1") return Mock_241;
    return [];
};

const fetchData = async (year: string, semester: string) => {
    if (import.meta.env.DEV) {
        return Mock(year, semester) as unknown as Course[];
    }
    const res = await fetch(
        `https://raw.githubusercontent.com/HALQME/omu-course-library/refs/heads/main/data/${year}/${semester}/index.json`
    );
    return res.json() as unknown as Course[];
};

const summaryData = (
    data: Course[],
    year: string,
    semester: string
): CourseSummary[] => {
    const semesterValue = year + "年度" + (semester == "0" ? "前期" : "後期");
    const courseEmbeds: CourseSummary[] = data.map((course) => {
        let courseEmbed: CourseSummary;
        if (course.semester.trim() == semesterValue.trim()) {
            courseEmbed = {
                id: course.id.slice(4),
                name: course.name,
                teachers: course.teachers,
                campus: course.campus,
                period: course.period,
            };
        } else {
            courseEmbed = {
                id: course.id.slice(4),
                name: course.name,
                teachers: course.teachers,
                campus: course.campus,
                semester: course.semester,
                period: course.period,
            };
        }

        return courseEmbed;
    });
    return courseEmbeds;
};