import type { FormDB, ReviewForm } from "@/types/schema";
import { reviews } from "db/schema";
import { postToFormDB, formToReviewDB } from "@/utils/data-parser";
type Reviews = typeof reviews.$inferInsert;

import { db } from "./db";

export function post(form: ReviewForm) {
    try {
        return db.transaction(async (tx) => {
            const review: Reviews = formToReviewDB(postToFormDB(form));
            const result = await tx.insert(reviews).values(review).execute();
            return result;
        });
    } catch (error) {
        console.error("Failed to insert review:", error);
        throw error;
    }
}
