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