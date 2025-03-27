import { Redis } from "@upstash/redis";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

const redis = new Redis({
    url: import.meta.env.KV_REST_API_URL,
    token: import.meta.env.KV_REST_API_TOKEN,
});

export const course = {
    addFavorite: defineAction({
        accept: "form",
        input: z.object({
            course_id: z.string(),
        }),
        handler: async (input) => {
            const courseKey = `course:${input.course_id}`;
            const courseValue = await redis.get(courseKey);
            if (courseValue === null) {
                return { status: "ok", course: input.course_id };
            }
            await redis.incr(courseKey);
            return { status: "ok", course: input.course_id };
        },
    }),

    removeFavorite: defineAction({
        accept: "form",
        input: z.object({
            course_id: z.string(),
        }),
        handler: async (input) => {
            const courseKey = `course:${input.course_id}`;
            const courseValue = await redis.get(courseKey);
            if (courseValue === null) {
                return { status: "ok", course: input.course_id };
            } else if (courseValue === "0") {
                return { status: "ok", course: input.course_id };
            }
            await redis.decr(courseKey);
            return { status: "ok", course: input.course_id };
        },
    }),

    getFavorite: defineAction({
        input: z.object({
            course_id: z.string(),
        }),
        handler: async (input) => {
            console.log("getFavorite", input);
            const count = await redis.get(`course:${input.course_id}`);
            if (count === null || count === undefined || count === "") {
                await redis.set(`course:${input.course_id}`, 0);
                return {
                    status: "ok",
                    course: input.course_id,
                    count: "0",
                };
            }
            return {
                status: "ok",
                course: input.course_id,
                count: count as string,
            };
        },
    }),
};
