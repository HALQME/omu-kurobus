import { z } from "zod";

export const DeatilCourseSchema = z.object({
    id: z.string(),
    name: z.string(),
    teachers: z.array(z.string()),
    semester: z.string(),
    year: z.string(),
    period: z.array(
        z.object({
            semester: z.string(),
            timetable: z.array(
                z.object({
                    period: z.string(),
                    weekday: z.string(),
                })
            ),
        })
    ),
    campus: z.string(),
    grade: z.string(),
    credits: z.number(),
    description: z.string(),
});
export type DeatilCourse = z.infer<typeof DeatilCourseSchema>;

export const CourseSchema = z.object({
    id: z.string(),
    name: z.string(),
    teachers: z.string(),
    semester: z.string(),
    period: z.string(),
    campus: z.string(),
    grade: z.string(),
    credits: z.number(),
    description: z.string(),
});
export type Course = z.infer<typeof CourseSchema>;

export const CourseSummarySchema = CourseSchema.pick({
    id: true,
    name: true,
    teachers: true,
    period: true,
    campus: true,
}).extend({
    semester: z.string().optional(),
});
export type CourseSummary = z.infer<typeof CourseSummarySchema>;

export const CourseSearchResultSchema = CourseSummarySchema.extend({
    score: z.number().optional(),
});
export type CourseSearchResult = z.infer<typeof CourseSearchResultSchema>;

export type DetailedSearchResult = z.infer<typeof CourseSchema> & {
    score: number | undefined;
};

export const ResponseSchema = z.object({
    code: z.number(),
    msg: z.string(),
    data: z.array(CourseSchema),
});
export type ResponseData = z.infer<typeof ResponseSchema>;

export const StorageHistorySchema = z.object({
    key: z.string(),
    value: z.string(),
});
export type StorageHistory = z.infer<typeof StorageHistorySchema>;

export const SearchQuerySchema = z.object({
    year: z.string(),
    semester: z.string(),
    course: z.string().optional(),
    teacher: z.string().optional(),
    campus: z.string().optional(),
    class_code: z.string().optional(),
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const SuggestionResultSchema = z.object({
    text: z.string(),
    score: z.number().optional(),
});
export type SuggestionResult = z.infer<typeof SuggestionResultSchema>;

// スライダー値のスキーマ（初期値なしで必須）
const sliderSchema = z.number().int().min(-2).max(2);

// その他テキスト入力のスキーマ
const otherTextSchema = z.string().max(100).nullable();

// 授業形態の選択肢
export const courseTypes = [
    "対面または実習",
    "同期オンライン",
    "非同期オンライン",
    "その他",
] as const;

// 評価基準の選択肢
export const evalCriteriaTypes = [
    "出席点",
    "期末テスト",
    "中間テスト",
    "期末レポート",
    "中間レポート",
    "毎回の課題",
    "その他",
] as const;

export const testTypes = [
    "対面・筆記",
    "対面・ウェブ",
    "遠隔",
    "その他",
] as const;

// テスト持ち込みの選択肢
export const testItemTypes = [
    "持ち込み無し",
    "レジュメ",
    "自筆ノート",
    "教科書",
    "その他",
] as const;

export const CourseReviewSubmissionSchema = z.object({
    // 基本情報
    course_id: z.string(),
    student_department: z.string().regex(/^[A-Z]{3}$/),

    // 授業形態（複数選択）
    courseType: z.array(z.enum(courseTypes)),
    courseTypeOtherText: otherTextSchema,

    // 評価基準（複数選択）
    evalCriteria: z.array(z.enum(evalCriteriaTypes)),
    evalCriteriaOtherText: otherTextSchema,

    // テストの実施形態
    testType: z.enum(testTypes).nullable(),
    testTypeOtherText: otherTextSchema,

    // テスト持ち込み
    testItems: z.array(z.enum(testItemTypes)).nullable(),
    testItemsOtherText: otherTextSchema,

    // 評価（すべて必須）
    classDifficulty: sliderSchema,
    testDifficulty: sliderSchema,
    testAmount: sliderSchema,
    gradingCriteria: sliderSchema,
    totalScore: sliderSchema,

    // コメント
    goodPoint: z.string().max(1000).optional(),
    notGoodPoint: z.string().max(1000).optional(),
    comment: z.string().max(1000).optional(),
});
export type CourseReviewSubmission = z.infer<
    typeof CourseReviewSubmissionSchema
>;

export const CourseReviewRecordSchema = CourseReviewSubmissionSchema.extend({
    id: z.string(),
    createdAt: z.date(),
    user_id: z.string().optional(),
});
export type CourseReviewRecord = z.infer<typeof CourseReviewRecordSchema>;

export const CourseScoreSchema = CourseReviewRecordSchema.pick({
    course_id: true,
    classDifficulty: true,
    testDifficulty: true,
    testAmount: true,
    gradingCriteria: true,
    totalScore: true,
}).extend({
    metadata: z.string().optional(), // metadata を追加
});
export type CourseScore = z.infer<typeof CourseScoreSchema>;

export const CourseAttributesSchema = CourseReviewRecordSchema.pick({
    course_id: true,
    courseType: true,
    courseTypeOtherText: true,
    evalCriteria: true,
    evalCriteriaOtherText: true,
    testType: true,
    testTypeOtherText: true,
    testItems: true,
    testItemsOtherText: true,
});
export type CourseAttributes = z.infer<typeof CourseAttributesSchema>;
