import { Redis } from "@upstash/redis";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

const redis = new Redis({
    url: import.meta.env.KV_REST_API_URL,
    token: import.meta.env.KV_REST_API_TOKEN,
});

// Redis操作のヘルパー関数
const getCourseKey = (courseId: string) => `course:${courseId}`;

const incrementFavoriteCount = async (courseId: string) => {
    const courseKey = getCourseKey(courseId);
    const courseValue = await redis.get(courseKey);
    if (courseValue === null) {
        return false;
    }
    await redis.incr(courseKey);
    return true;
};

export const decrementFavoriteCount = async (courseId: string) => {
    const courseKey = getCourseKey(courseId);
    const courseValue = await redis.get(courseKey);
    if (courseValue === null || courseValue === "0") {
        return false;
    }
    await redis.decr(courseKey);
    return true;
};

const getFavoriteCount = async (courseId: string) => {
    const count = await redis.get(getCourseKey(courseId));
    if (count === null || count === undefined || count === "") {
        await redis.set(getCourseKey(courseId), 0);
        return "0";
    }
    return count as string;
};

export const course = {
    addFavorite: defineAction({
        accept: "form",
        input: z.object({
            course_id: z.string(),
        }),
        handler: async (input) => {
            await incrementFavoriteCount(input.course_id);
            return { status: "ok", course: input.course_id };
        },
    }),

    removeFavorite: defineAction({
        accept: "form",
        input: z.object({
            course_id: z.string(),
        }),
        handler: async (input) => {
            await decrementFavoriteCount(input.course_id);
            return { status: "ok", course: input.course_id };
        },
    }),

    getFavorite: defineAction({
        input: z.object({
            course_id: z.string(),
        }),
        handler: async (input) => {
            console.log("getFavorite", input);
            const count = await getFavoriteCount(input.course_id);
            return {
                status: "ok",
                course: input.course_id,
                count,
            };
        },
    }),
};
