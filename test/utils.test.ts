// _row_data.jsonからCourseEmbed型の配列を作成する

import { CourseEmbedSchema } from "@/types/schema";
import type { CourseEmbed, Course } from "@/types/schema";

const courses = require("./_row_data.json") as Course[];

const year = "2024";
const semester = "1";

const semesterValue = year + "年度" + (semester === "1" ? "前期" : "後期");

const courseEmbeds: CourseEmbed[] = courses.map((course) => {
    const courseEmbed: CourseEmbed = {
        id: course.id,
        name: course.name,
        teachers: course.teachers,
        campus: course.campus,
        semester: course.semester === semesterValue ? semesterValue : undefined,
        period: course.period,
    };
    return courseEmbed;
});

// 書き込み
const fs = require("fs");
import { describe, it } from "vitest";

describe("Search Queries", () => {
    it("normal search", async () => {
        fs.writeFileSync(
            "./test/_embed_data.json",
            JSON.stringify(courseEmbeds, null, 2)
        );
    });
});
