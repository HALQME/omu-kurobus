import { z } from "zod";

export const CourseSchema = z.object({
    id: z.string(),
    name: z.string(),
    teachers: z.string(),
    semester: z.string(),
    period: z.string(),
    campus: z.string(),
    grade: z.string(),
    credits: z.string(),
    description: z.string(),
});
export type Course = z.infer<typeof CourseSchema>;

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
    campus: z.enum(["0", "1", "2", "3"]).optional(),
    class_code: z.string().optional(),
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
