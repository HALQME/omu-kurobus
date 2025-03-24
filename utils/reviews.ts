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
    return records
        .map((record) => {
            const result = CourseReviewRecordSchema.safeParse(record);
            return result.success ? result.data : null;
        })
        .filter((record): record is CourseReviewRecord => record !== null);
}
