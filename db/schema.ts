import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const reviews = sqliteTable("reviews", {
    id: text("id").primaryKey(),
    createdAt: text("created_at").notNull(),

    // コース情報
    course_id: text("course_id").notNull(),
    student_department: text("student_department").notNull(),

    // 授業形態（JSON)
    courseType: text("course_type").notNull(), // JSON配列
    courseTypeOtherText: text("course_type_other_text"),

    // 評価基準（JSON）
    evalCriteria: text("eval_criteria").notNull(), // JSON配列
    evalCriteriaOtherText: text("eval_criteria_other_text"),

    // テストの実施形態
    testType: text("test_type"),
    testTypeOtherText: text("test_type_other_text"),

    // テスト持ち込み（JSON）
    testItems: text("test_items"), // JSON配列（null許容）
    testItemsOtherText: text("test_items_other_text"),

    // 評価（-2から2のスライダー値）
    classDifficulty: integer("class_difficulty").notNull(),
    testDifficulty: integer("test_difficulty").notNull(),
    testAmount: integer("test_amount").notNull(),
    gradingCriteria: integer("grading_criteria").notNull(),
    recommendation: integer("recommendation").notNull(),

    // コメント
    goodPoint: text("good_point"),
    notGoodPoint: text("not_good_point"),
    comment: text("comment"),
});
