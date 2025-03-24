import type { CourseReviewSubmission } from "@/types/schema";
import { reviews } from "db/schema";
import { submitCourseReview, convertToReviewRecord } from "@/utils/data-parser";
type Reviews = typeof reviews.$inferInsert;

import { db } from "./db";

export function post(submission: CourseReviewSubmission) {
    try {
        return db.transaction(async (tx) => {
            const review: Reviews = convertToReviewRecord(
                submitCourseReview(submission)
            );
            const result = await tx.insert(reviews).values(review).execute();
            return result;
        });
    } catch (error) {
        console.error("Failed to insert review:", error);
        throw error;
    }
}
