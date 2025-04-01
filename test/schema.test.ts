import { describe, it, expect } from "vitest";
import {
    DetailCourseSchema,
    type CourseReviewRecord,
    type CourseReviewSubmission,
} from "@/types/schema";
import { reviews } from "db/schema";
import {
    submitCourseReview,
    convertToReviewRecord,
    hydrateReviewRecord,
} from "@/utils/data-parser";

// 必要な型定義
type ReviewDB = typeof reviews.$inferInsert;

const sampleReviewRecord: CourseReviewRecord = {
    id: "test-id",
    course_id: "20241AAA005001",
    student_department: "AAA12345",
    courseType: ["対面または実習"],
    courseTypeOtherText: null,
    evalCriteria: ["期末テスト", "出席点"],
    evalCriteriaOtherText: null,
    testType: "対面・筆記",
    testTypeOtherText: null,
    testItems: ["持ち込み無し"],
    testItemsOtherText: null,
    classDifficulty: 1,
    testDifficulty: 0,
    testAmount: -1,
    gradingCriteria: 2,
    totalScore: 1,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    goodPoint: "とても分かりやすい授業でした",
    notGoodPoint: undefined,
    comment: undefined,
};

const sampleSubmission: CourseReviewSubmission = {
    course_id: "20241AAA005001",
    student_department: "AAA12345",
    courseType: ["対面または実習"],
    courseTypeOtherText: null,
    evalCriteria: ["期末テスト", "出席点"],
    evalCriteriaOtherText: null,
    testType: "対面・筆記",
    testTypeOtherText: null,
    testItems: ["持ち込み無し"],
    testItemsOtherText: null,
    classDifficulty: 1,
    testDifficulty: 0,
    testAmount: -1,
    gradingCriteria: 2,
    totalScore: 1,
    goodPoint: "とても分かりやすい授業でした",
    notGoodPoint: undefined,
    comment: undefined,
};

const sampleReviewDB: ReviewDB = {
    id: "test-id",
    course_id: "20241AAA005001",
    student_department: "AAA12345",
    courseType: JSON.stringify(["対面または実習"]),
    courseTypeOtherText: null,
    evalCriteria: JSON.stringify(["期末テスト", "出席点"]),
    evalCriteriaOtherText: null,
    testType: "対面・筆記",
    testTypeOtherText: null,
    testItems: JSON.stringify(["持ち込み無し"]),
    testItemsOtherText: null,
    classDifficulty: 1,
    testDifficulty: 0,
    testAmount: -1,
    gradingCriteria: 2,
    totalscore: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    goodPoint: "とても分かりやすい授業でした",
    notGoodPoint: undefined,
    comment: undefined,
};

describe("スキーマ変換テスト", () => {
    it("CourseReviewSubmission => ReviewDB", () => {
        const submission = submitCourseReview(sampleSubmission);
        const reviewDB = convertToReviewRecord(submission);
        const { createdAt: dbCreatedAt, id: dbId, ...restDB } = reviewDB;
        const { createdAt: cat, id: sid, ...rests } = sampleReviewDB;

        expect(restDB).toEqual(rests);
    });

    it("CourseReviewRecord => ReviewDB", () => {
        const reviewDB = convertToReviewRecord(sampleReviewRecord);

        expect(reviewDB.id).toBe(sampleReviewRecord.id);
        expect(reviewDB.course_id).toBe(sampleReviewRecord.course_id);
        expect(reviewDB.student_department).toBe(
            sampleReviewRecord.student_department
        );
        expect(JSON.parse(reviewDB.courseType)).toEqual(
            sampleReviewRecord.courseType
        );
        expect(JSON.parse(reviewDB.evalCriteria)).toEqual(
            sampleReviewRecord.evalCriteria
        );
        expect(reviewDB.testType).toBe(sampleReviewRecord.testType);
        expect(JSON.parse(reviewDB.testItems!)).toEqual(
            sampleReviewRecord.testItems
        );
        expect(reviewDB.classDifficulty).toBe(
            sampleReviewRecord.classDifficulty
        );
        expect(reviewDB.testDifficulty).toBe(sampleReviewRecord.testDifficulty);
        expect(reviewDB.testAmount).toBe(sampleReviewRecord.testAmount);
        expect(reviewDB.gradingCriteria).toBe(
            sampleReviewRecord.gradingCriteria
        );
        expect(reviewDB.totalscore).toBe(sampleReviewRecord.totalScore);
        expect(reviewDB.createdAt).toBe(
            sampleReviewRecord.createdAt.toISOString()
        );
    });

    it("ReviewDB => CourseReviewRecord", () => {
        const parsedRecord = hydrateReviewRecord(sampleReviewDB);

        expect(parsedRecord.id).toBe(sampleReviewDB.id);
        expect(parsedRecord.course_id).toBe(sampleReviewDB.course_id);
        expect(parsedRecord.student_department).toBe(
            sampleReviewDB.student_department
        );
        expect(parsedRecord.courseType).toEqual(
            JSON.parse(sampleReviewDB.courseType)
        );
        expect(parsedRecord.evalCriteria).toEqual(
            JSON.parse(sampleReviewDB.evalCriteria)
        );
        expect(parsedRecord.testType).toBe(sampleReviewDB.testType);
        expect(parsedRecord.testItems).toEqual(
            JSON.parse(sampleReviewDB.testItems!)
        );
        expect(parsedRecord.classDifficulty).toBe(
            sampleReviewDB.classDifficulty
        );
        expect(parsedRecord.testDifficulty).toBe(sampleReviewDB.testDifficulty);
        expect(parsedRecord.testAmount).toBe(sampleReviewDB.testAmount);
        expect(parsedRecord.gradingCriteria).toBe(
            sampleReviewDB.gradingCriteria
        );
        expect(parsedRecord.totalScore).toBe(sampleReviewDB.totalscore);
        expect(parsedRecord.createdAt.toISOString()).toBe(
            sampleReviewDB.createdAt
        );
    });
});

import { convertToSummary } from "@/utils/fetch-course";
const deatil = await import("test/_details.json");
const details = deatil.default;
const detail = DetailCourseSchema.safeParse(details);
describe("詳細情報のスキーマ検証", () => {
    it("詳細情報が正しい形式であること", () => {
        expect(detail.success).toBe(true);
    });

    it("詳細情報のエラーメッセージが正しいこと", () => {
        if (!detail.success) {
            expect(detail.error).toBeDefined();
        } else {
            expect(detail.error).toBeUndefined();
        }
    });

    it("Summaryへの変換", () => {
        const summary = convertToSummary(details);
        expect(summary).toBeDefined();
        console.log(summary);
        expect(summary).toHaveProperty("id");
        expect(summary).toHaveProperty("name");
        expect(summary).toHaveProperty("teachers");
        expect(summary).toHaveProperty("campus");
        expect(summary).toHaveProperty("period");
    });
});