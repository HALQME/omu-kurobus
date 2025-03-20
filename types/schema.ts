import { z } from "zod";

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

export const CourseEmbedSchema = z.object({
    id: z.string(),
    name: z.string(),
    teachers: z.string(),
    campus: z.string(),
});
export type CourseEmbed = z.infer<typeof CourseEmbedSchema>;

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

export type SearchResult = z.infer<typeof CourseSchema> & {
    score: number | undefined;
};

export const SuggestionResultSchema = z.object({
    text: z.string(),
    score: z.number().optional(),
});

export type SuggestionResult = z.infer<typeof SuggestionResultSchema>;

// スライダー値のスキーマ（初期値なしで必須）
const sliderSchema = z.number().int().min(1).max(4);

// その他テキスト入力のスキーマ
const otherTextSchema = z.string().max(100).optional();

// 授業形態の選択肢
const courseTypes = [
    "対面または実習",
    "同期オンライン",
    "非同期オンライン",
    "その他",
] as const;

// 評価基準の選択肢
const evalCriteriaTypes = [
    "出席点",
    "期末テスト",
    "中間テスト",
    "期末レポート",
    "中間レポート",
    "毎回の課題",
    "その他",
] as const;

// テスト持ち込みの選択肢
const testItemTypes = [
    "持ち込み無し",
    "レジュメ",
    "自筆ノート",
    "教科書",
    "その他",
] as const;

export const ReviewFormSchema = z.object({
    // 基本情報
    course_id: z.string(),
    student_department: z.string().regex(/^[A-Z]{3}$/),

    // 授業形態（複数選択）
    courseType: z.array(z.enum(courseTypes)).min(1),
    courseTypeOtherText: otherTextSchema,

    // 評価基準（複数選択）
    evalCriteria: z.array(z.enum(evalCriteriaTypes)).min(1),
    evalCriteriaOtherText: otherTextSchema,

    // テストの実施形態
    testType: z.enum(["対面", "遠隔", "その他"]).optional(),
    testTypeOtherText: otherTextSchema,

    // テスト持ち込み
    testItems: z.array(z.enum(testItemTypes)).optional(),
    testItemsOtherText: otherTextSchema,

    // 評価（すべて必須）
    classDifficulty: sliderSchema,
    testDifficulty: sliderSchema,
    testAmount: sliderSchema,
    gradingCriteria: sliderSchema,
    recommendation: sliderSchema,

    // コメント
    goodPoint: z.string().max(1000).optional(),
    notGoodPoint: z.string().max(1000).optional(),
    comment: z.string().max(1000).optional(),
});
export type ReviewForm = z.infer<typeof ReviewFormSchema>;

export const FormDBSchema = ReviewFormSchema.extend({
    id: z.string(),
    createdAt: z.date(),
    user_id: z.string().optional(),
});
export type FormDB = z.infer<typeof FormDBSchema>;