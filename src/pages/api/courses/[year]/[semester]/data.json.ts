import type { APIRoute } from "astro";
import { type Course, type CourseSummary } from "@/types/schema";
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

const fetchData = async (year: string, semester: string) => {
    const res = await fetch(
        `https://raw.githubusercontent.com/HALQME/omu-course-library/refs/heads/main/data/${year}/${semester}/data.json`
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