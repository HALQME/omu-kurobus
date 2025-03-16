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
    campus: z.array(z.string()).optional(),
    class_code: z.string().optional(),
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const SearchResultSchema = z.object({
    score: z.number().optional(),
    name: z.string(),
    code: z.string(),
    teachers: z.string(),
    campus: z.string(),
    semester: z.string(),
    period: z.string(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;