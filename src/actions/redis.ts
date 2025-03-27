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
            console.log("addFavorite", input);
            if (redis.get(`course:${input.course_id}`) === null) {
                await redis.set(`course:${input.course_id}`, 0);
            }
            await redis.incr(`course:${input.course_id}`);
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
