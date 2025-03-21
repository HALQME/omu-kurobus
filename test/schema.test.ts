import { describe, it, expect } from "vitest";
import type { FormDB, ReviewForm } from "@/types/schema";
import { reviews } from "db/schema";
import {
    postToFormDB,
    formToReviewDB,
    reviewToFormDB,
} from "@/utils/data-parser";

// 必要な型定義
type ReviewDB = typeof reviews.$inferInsert;

const sampleFormDB: FormDB = {
    id: "test-id",
    course_id: "20241AAA005001",
    student_department: "AAA12345",
    courseType: ["対面または実習"],
    courseTypeOtherText: null,
    evalCriteria: ["期末テスト", "出席点"],
    evalCriteriaOtherText: null,
    testType: "対面",
    testTypeOtherText: null,
    testItems: ["持ち込み無し"],
    testItemsOtherText: null,
    classDifficulty: 1,
    testDifficulty: 0,
    testAmount: -1,
    gradingCriteria: 2,
    recommendation: 1,
    createdAt: new Date("2024-01-01"),
    goodPoint: "とても分かりやすい授業でした",
    notGoodPoint: undefined,
    comment: undefined,
};

const sampleReviewForm: ReviewForm = {
    course_id: "20241AAA005001",
    student_department: "AAA",
    courseType: ["対面または実習"],
    courseTypeOtherText: "",
    evalCriteria: ["期末テスト", "出席点"],
    evalCriteriaOtherText: "",
    testType: "対面",
    testTypeOtherText: "",
    testItems: ["持ち込み無し"],
    testItemsOtherText: "",
    classDifficulty: 1,
    testDifficulty: 0,
    testAmount: -1,
    gradingCriteria: 2,
    recommendation: 1,
    goodPoint: "とても分かりやすい授業でした",
    notGoodPoint: "授業が長すぎる",
    comment: "授業が長すぎる",
};

const sampleReviewDB: ReviewDB = {
    id: "test-id",
    course_id: "20241AAA005001",
    student_department: "AAA",
    courseType: JSON.stringify(["対面または実習"]),
    courseTypeOtherText: "",
    evalCriteria: JSON.stringify(["期末テスト", "出席点"]),
    evalCriteriaOtherText: "",
    testType: "対面",
    testTypeOtherText: "",
    testItems: JSON.stringify(["持ち込み無し"]),
    testItemsOtherText: "",
    classDifficulty: 1,
    testDifficulty: 0,
    testAmount: -1,
    gradingCriteria: 2,
    recommendation: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    goodPoint: "とても分かりやすい授業でした",
    notGoodPoint: "授業が長すぎる",
    comment: "授業が長すぎる",
};

describe("スキーマ変換テスト", () => {
    it("FormDB => ReviewForm", () => {
        const reviewForm = postToFormDB(sampleFormDB);
        expect(reviewForm).toEqual(sampleReviewForm);
    });

    it("ReviewForm => FormDB", () => {
        const formDB = postToFormDB(sampleReviewForm);
        expect(formDB).toEqual(sampleFormDB);
    });

    it("ReviewForm => ReviewDB", () => {});
    it("FormDB => ReviewDB", () => {
        const reviewDB = formToReviewDB(sampleFormDB);

        expect(reviewDB.id).toBe(sampleFormDB.id);
        expect(reviewDB.course_id).toBe(sampleFormDB.course_id);
        expect(reviewDB.student_department).toBe(
            sampleFormDB.student_department
        );
        expect(JSON.parse(reviewDB.courseType)).toEqual(
            sampleFormDB.courseType
        );
        expect(JSON.parse(reviewDB.evalCriteria)).toEqual(
            sampleFormDB.evalCriteria
        );
        expect(reviewDB.testType).toBe(sampleFormDB.testType);
        expect(JSON.parse(reviewDB.testItems!)).toEqual(sampleFormDB.testItems);
        expect(reviewDB.classDifficulty).toBe(sampleFormDB.classDifficulty);
        expect(reviewDB.testDifficulty).toBe(sampleFormDB.testDifficulty);
        expect(reviewDB.testAmount).toBe(sampleFormDB.testAmount);
        expect(reviewDB.gradingCriteria).toBe(sampleFormDB.gradingCriteria);
        expect(reviewDB.recommendation).toBe(sampleFormDB.recommendation);
        expect(reviewDB.createdAt).toBe(sampleFormDB.createdAt.toISOString());
    });

    it("ReviewDB => FormDB", () => {
        const parsedFormDB = reviewToFormDB(sampleReviewDB);

        expect(parsedFormDB.id).toBe(sampleReviewDB.id);
        expect(parsedFormDB.course_id).toBe(sampleReviewDB.course_id);
        expect(parsedFormDB.student_department).toBe(
            sampleReviewDB.student_department
        );
        expect(parsedFormDB.courseType).toEqual(
            JSON.parse(sampleReviewDB.courseType)
        );
        expect(parsedFormDB.evalCriteria).toEqual(
            JSON.parse(sampleReviewDB.evalCriteria)
        );
        expect(parsedFormDB.testType).toBe(sampleReviewDB.testType);
        expect(parsedFormDB.testItems).toEqual(
            JSON.parse(sampleReviewDB.testItems!)
        );
        expect(parsedFormDB.classDifficulty).toBe(
            sampleReviewDB.classDifficulty
        );
        expect(parsedFormDB.testDifficulty).toBe(sampleReviewDB.testDifficulty);
        expect(parsedFormDB.testAmount).toBe(sampleReviewDB.testAmount);
        expect(parsedFormDB.gradingCriteria).toBe(
            sampleReviewDB.gradingCriteria
        );
        expect(parsedFormDB.recommendation).toBe(sampleReviewDB.recommendation);
        expect(parsedFormDB.createdAt.toISOString()).toBe(
            sampleReviewDB.createdAt
        );
    });
});
