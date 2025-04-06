import type { CourseSummary, DetailCourse } from "@/types/schema";

export async function getCourseSummary(id: string): Promise<CourseSummary[]> {
    let year = id.slice(0, 4);
    let det = await fetch(
        `https://raw.githubusercontent.com/HALQME/omu-course-library/refs/heads/main/data/${year}/id/${id}.json`
    );
    const data: DetailCourse = await det.json();
    return convertToSummary(data);
}

export function convertToSummary(data: DetailCourse): CourseSummary[] {
    var periodValue: string;

    if (data.period.length === 1) {
        periodValue = Array.isArray(data.period[0].timetable)
            ? data.period[0].timetable
                  .map((tt) => `${tt.weekday.slice(0, 2)}${tt.period}`)
                  .join("、")
            : String(data.period[0].timetable);

        let result: CourseSummary = {
            campus: data.campus,
            id: data.id,
            name: data.name,
            period: periodValue,
            teachers: data.teachers.join("、"),
            semester: data.year + "年度" + data.period[0].semester,
        };
        return [result];
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

    let results: CourseSummary[] = data.period.map((tt) => {
        let periodValue = Array.isArray(tt.timetable)
            ? tt.timetable
                  .map((tt) => `${tt.weekday.slice(0, 2)}${tt.period}`)
                  .join("、")
            : String(tt.timetable);

        let result: CourseSummary = {
            campus: data.campus,
            id: data.id,
            name: data.name,
            period: periodValue,
            teachers: data.teachers.join("、"),
            semester: data.year + "年度" + tt.semester,
        };
        return result;
    });
    return results;
}
