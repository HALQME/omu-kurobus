import type { CourseSummary, DeatilCourse } from "@/types/schema";

export async function getCourseSummary(
    year: string,
    semester: string,
    id: string
): Promise<CourseSummary> {
    let det = await fetch(
        `https://raw.githubusercontent.com/HALQME/omu-course-library/refs/heads/main/data/${year}/${semester}/id/${id}.json`
    );
    const data: DeatilCourse = await det.json();
    return convertToSummary(data);
}

export function convertToSummary(data: DeatilCourse): CourseSummary {
    var periodValue: string;

    if (data.period.length === 1) {
        periodValue = Array.isArray(data.period[0].timetable)
            ? data.period[0].timetable
                  .map((tt) => `${tt.weekday.slice(0, 2)}${tt.period}`)
                  .join("、")
            : String(data.period[0].timetable);
    } else {
        periodValue = data.period
            .map(
                (tt) =>
                    `${tt.semester}(${tt.timetable
                        .map((ttv) => `${ttv.weekday.slice(0, 2)}${ttv.period}`)
                        .join("、")})`
            )
            .join("、");
    }

    let result: CourseSummary = {
        campus: data.campus,
        id: data.id,
        name: data.name,
        period: periodValue,
        teachers: data.teachers.join("、"),
    };
    return result;
}
