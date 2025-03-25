import { db } from "@/utils/db";
import { eq } from "drizzle-orm";
import { reviews } from "db/schema";
import type { CourseReviewRecord } from "@/types/schema";
import { CourseReviewRecordSchema } from "@/types/schema";

export async function getReviews(
    courseId: string
): Promise<CourseReviewRecord[] | null> {
    const records = await db
        .select()
        .from(reviews)
        .where(eq(reviews.course_id, courseId));
    if (!records) return null;
    const parsedRecords: CourseReviewRecord[] = records.map((record) => {
        return {
            id: record.id,
            createdAt: new Date(record.createdAt),
            course_id: record.course_id,
            student_department: record.student_department,
            courseType: JSON.parse(record.courseType),
            courseTypeOtherText: record.courseTypeOtherText,
            evalCriteria: JSON.parse(record.evalCriteria),
            evalCriteriaOtherText: record.evalCriteriaOtherText,
            testType: record.testType as
                | "その他"
                | "対面・筆記"
                | "対面・ウェブ"
                | "遠隔"
                | null,
            testTypeOtherText: record.testTypeOtherText,
            testItems: record.testItems ? JSON.parse(record.testItems) : [],
            testItemsOtherText: record.testItemsOtherText,
            classDifficulty: record.classDifficulty,
            testDifficulty: record.testDifficulty,
            testAmount: record.testAmount,
            gradingCriteria: record.gradingCriteria,
            totalScore: record.totalscore,
            goodPoint: record.goodPoint ?? undefined,
            notGoodPoint: record.notGoodPoint ?? undefined,
            comment: record.comment ?? undefined,
        };
    });

    return parsedRecords;
}
