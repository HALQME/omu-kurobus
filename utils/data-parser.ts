import type {
    CourseReviewRecord,
    CourseReviewSubmission,
} from "@/types/schema";
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
 * Converts a CourseReviewSubmission to a CourseReviewRecord format suitable for database storage.
 * @param submission - The user-submitted review form containing course evaluation data
 * @returns A CourseReviewRecord object ready for database insertion
 */
export function submitCourseReview(
    submission: CourseReviewSubmission
): CourseReviewRecord {
    return {
        id: randomUUID(),
        course_id: submission.course_id,
        student_department: submission.student_department,
        courseType: submission.courseType,
        courseTypeOtherText: submission.courseTypeOtherText ?? null,
        createdAt: new Date(),
        evalCriteria: submission.evalCriteria,
        evalCriteriaOtherText: submission.evalCriteriaOtherText ?? null,
        testType: submission.testType ?? null,
        testTypeOtherText: submission.testTypeOtherText ?? null,
        testItems: submission.testItems ?? null,
        testItemsOtherText: submission.testItemsOtherText ?? null,
        classDifficulty: submission.classDifficulty,
        testDifficulty: submission.testDifficulty,
        testAmount: submission.testAmount,
        gradingCriteria: submission.gradingCriteria,
        totalScore: submission.totalScore,
        goodPoint: submission.goodPoint ?? undefined,
        notGoodPoint: submission.notGoodPoint ?? undefined,
        comment: submission.comment ?? undefined,
    };
}

/**
 * CourseReviewRecordからReviewDBへの変換関数
 * - 配列をJSON文字列に変換
 * - Date型をISO文字列に変換
 * - undefined値をnullに変換
 */
export function convertToReviewRecord(record: CourseReviewRecord): ReviewDB {
    return {
        id: record.id,
        course_id: record.course_id,
        student_department: record.student_department,
        courseType: JSON.stringify(record.courseType),
        courseTypeOtherText: record.courseTypeOtherText ?? null,
        evalCriteria: JSON.stringify(record.evalCriteria),
        evalCriteriaOtherText: record.evalCriteriaOtherText ?? null,
        testType: record.testType ?? null,
        testTypeOtherText: record.testTypeOtherText ?? null,
        testItems: record.testItems ? JSON.stringify(record.testItems) : null,
        testItemsOtherText: record.testItemsOtherText ?? null,
        classDifficulty: record.classDifficulty,
        testDifficulty: record.testDifficulty,
        testAmount: record.testAmount,
        gradingCriteria: record.gradingCriteria,
        totalscore: record.totalScore,
        createdAt: record.createdAt.toISOString(),
        goodPoint: record.goodPoint ?? undefined,
        notGoodPoint: record.notGoodPoint ?? undefined,
        comment: record.comment ?? undefined,
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
 * ReviewDBからCourseReviewRecordへの変換関数
 */
export function hydrateReviewRecord(review: ReviewDB): CourseReviewRecord {
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
        totalScore: review.totalscore,
        createdAt: new Date(review.createdAt),
        goodPoint: review.goodPoint || undefined,
        notGoodPoint: review.notGoodPoint || undefined,
        comment: review.comment || undefined,
    };
}
