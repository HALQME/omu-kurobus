import type { FormDB, ReviewForm } from "@/types/schema";
import {
    courseTypes,
    evalCriteriaTypes,
    testItemTypes,
    testTypes,
} from "@/types/schema";
import { reviews } from "db/schema";
import { randomUUID } from "node:crypto";

type ReviewDB = typeof reviews.$inferInsert;
type TestType = (typeof testTypes)[number];

/**
 * Converts a ReviewForm object to a FormDB object format suitable for database storage.
 * @param form - The user-submitted review form containing course evaluation data
 * @returns A FormDB object ready for database insertion
 */
export function postToFormDB(form: ReviewForm): FormDB {
    return {
        id: randomUUID(),
        course_id: form.course_id,
        student_department: form.student_department,
        courseType: form.courseType,
        courseTypeOtherText: form.courseTypeOtherText ?? null,
        createdAt: new Date(),
        evalCriteria: form.evalCriteria,
        evalCriteriaOtherText: form.evalCriteriaOtherText ?? null,
        testType: form.testType ?? null,
        testTypeOtherText: form.testTypeOtherText ?? null,
        testItems: form.testItems ?? null,
        testItemsOtherText: form.testItemsOtherText ?? null,
        classDifficulty: form.classDifficulty,
        testDifficulty: form.testDifficulty,
        testAmount: form.testAmount,
        gradingCriteria: form.gradingCriteria,
        recommendation: form.recommendation,
        goodPoint: form.goodPoint ?? undefined,
        notGoodPoint: form.notGoodPoint ?? undefined,
        comment: form.comment ?? undefined,
    };
}

/**
 * FormDBからReviewDBへの変換関数
 * - 配列をJSON文字列に変換
 * - Date型をISO文字列に変換
 * - undefined値をnullに変換
 */
export function formToReviewDB(form: FormDB): ReviewDB {
    return {
        id: form.id,
        course_id: form.course_id,
        student_department: form.student_department,
        courseType: JSON.stringify(form.courseType),
        courseTypeOtherText: form.courseTypeOtherText ?? null,
        evalCriteria: JSON.stringify(form.evalCriteria),
        evalCriteriaOtherText: form.evalCriteriaOtherText ?? null,
        testType: form.testType ?? null,
        testTypeOtherText: form.testTypeOtherText ?? null,
        testItems: form.testItems ? JSON.stringify(form.testItems) : null,
        testItemsOtherText: form.testItemsOtherText ?? null,
        classDifficulty: form.classDifficulty,
        testDifficulty: form.testDifficulty,
        testAmount: form.testAmount,
        gradingCriteria: form.gradingCriteria,
        recommendation: form.recommendation,
        createdAt: form.createdAt.toISOString(),
        goodPoint: form.goodPoint ?? undefined,
        notGoodPoint: form.notGoodPoint ?? undefined,
        comment: form.comment ?? undefined,
    };
}

function parseStringArray<T extends string>(
    json: string,
    validValues: readonly T[]
): T[] {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
        throw new Error("Invalid array format");
    }

    if (!parsed.every((item) => validValues.includes(item as T))) {
        throw new Error("Invalid array values");
    }

    return parsed as T[];
}

/**
 * ReviewDBからFormDBへの変換関数
 */
export function reviewToFormDB(review: ReviewDB): FormDB {
    // testTypeの型安全な変換
    const testType = review.testType as TestType | null;
    if (testType !== null && !testTypes.includes(testType)) {
        throw new Error("Invalid test type");
    }

    return {
        id: review.id,
        course_id: review.course_id,
        student_department: review.student_department,
        courseType: parseStringArray(review.courseType, courseTypes),
        courseTypeOtherText: review.courseTypeOtherText || null,
        evalCriteria: parseStringArray(review.evalCriteria, evalCriteriaTypes),
        evalCriteriaOtherText: review.evalCriteriaOtherText || null,
        testType: testType,
        testTypeOtherText: review.testTypeOtherText || null,
        testItems: review.testItems
            ? parseStringArray(review.testItems, testItemTypes)
            : null,
        testItemsOtherText: review.testItemsOtherText || null,
        classDifficulty: review.classDifficulty,
        testDifficulty: review.testDifficulty,
        testAmount: review.testAmount,
        gradingCriteria: review.gradingCriteria,
        recommendation: review.recommendation,
        createdAt: new Date(review.createdAt),
        goodPoint: review.goodPoint || undefined,
        notGoodPoint: review.notGoodPoint || undefined,
        comment: review.comment || undefined,
    };
}
