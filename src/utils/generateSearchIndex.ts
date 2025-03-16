import type { Course } from "@/types/schema";
import { AVAILABLE_PAIRS } from "@/utils/const";
import https from "node:https";
import fetch from "node-fetch";
import fs from "node:fs/promises";
import path from "node:path";
import * as FuseModule from "fuse.js";
import moji from "moji";
import TinySegmenter from "tiny-segmenter";
import { bigram, trigram } from "n-gram";

interface TokenizedData {
    courses: {
        text: string;
        tokens: string[];
        details: {
            teachers?: string;
            campus?: string;
            classCode?: string;
        };
    }[];
    teachers: {
        text: string;
        tokens: string[];
    }[];
    fuseIndex: Record<string, any>; // Serialized Fuse.js index
}

// Character normalization using moji
function normalizeText(text: string): string {
    return moji(text)
        .convert("ZE", "HE") // 全角英数字→半角
        .convert("ZS", "HS") // 全角スペース→半角
        .toString()
        .toLowerCase();
}

// Tokenization using tiny-segmenter and n-gram
function tokenize(text: string): string[] {
    const normalized = normalizeText(text);
    const segmenter = new TinySegmenter();

    // Get words using TinySegmenter
    const words = segmenter.segment(normalized);

    // Generate n-grams (bigrams and trigrams) for better partial matching
    const bigrams = bigram(normalized);
    const trigrams = trigram(normalized);

    // Generate tokens for individual characters (useful for kanji)
    const chars = normalized.split("");

    // English word handling
    const englishWords = normalized.match(/[a-z0-9]+/g) || [];

    // Combine all tokens and remove duplicates
    const allTokens = [
        ...words,
        ...bigrams,
        ...trigrams,
        ...chars,
        ...englishWords,
    ];
    return [...new Set(allTokens)];
}

// Fuse.js options for index generation
const fuseOptions: FuseModule.IFuseOptions<Course> = {
    keys: [
        {
            name: "name",
            weight: 0.4,
        },
        {
            name: "teachers",
            weight: 0.3,
        },
        {
            name: "id",
            weight: 0.2,
        },
        {
            name: "description",
            weight: 0.1,
        },
    ],
    threshold: 0.3,
    includeScore: true,
    ignoreLocation: true,
    useExtendedSearch: true,
};

async function generateSearchIndex() {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const tokenizedData: TokenizedData = {
        courses: [],
        teachers: [],
        fuseIndex: {},
    };
    const teacherSet = new Set<string>();
    const allCourses: Course[] = [];

    try {
        for (const pair of AVAILABLE_PAIRS()) {
            if (pair.type !== "submit") continue;

            const res = await fetch(
                `https://catalog.sp.omu.ac.jp/api/search.json?year=${pair.path.year}&semesters=${pair.path.semester}`,
                { agent: httpsAgent }
            );
            const data = (await res.json()) as {
                code: number;
                msg: string;
                data: Course[];
            };

            if (data.code !== 200) continue;

            // Add courses to the complete list
            allCourses.push(...data.data);

            // Process course data
            for (const course of data.data) {
                // Course name tokenization
                tokenizedData.courses.push({
                    text: course.name,
                    tokens: tokenize(course.name),
                    details: {
                        teachers: course.teachers,
                        campus: course.campus,
                        classCode: course.id,
                    },
                });

                // Teacher name tokenization
                if (course.teachers && !teacherSet.has(course.teachers)) {
                    teacherSet.add(course.teachers);
                    tokenizedData.teachers.push({
                        text: course.teachers,
                        tokens: tokenize(course.teachers),
                    });
                }
            }
        }

        // Generate Fuse.js index
        const fuse = new FuseModule.default(allCourses, fuseOptions);
        const indexData = fuse.getIndex();
        // Store the index data (documentation lists _docs and _map as private but they are needed for serialization)
        tokenizedData.fuseIndex = {
            docs: (indexData as any)._docs,
            map: (indexData as any)._map,
            options: fuseOptions,
        };

        // Create public/search directory
        const searchDir = path.join(process.cwd(), "public", "search");
        await fs.mkdir(searchDir, { recursive: true });

        // Save tokenized data and Fuse.js index
        await fs.writeFile(
            path.join(searchDir, "tokenized.json"),
            JSON.stringify(tokenizedData, null, 2)
        );

        console.log("Search index generated successfully");
    } catch (error) {
        console.error("Error generating search index:", error);
        process.exit(1);
    }
}

generateSearchIndex();
