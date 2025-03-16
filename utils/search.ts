import * as FuseModule from "fuse.js";
import type { SearchQuery, Course } from "@/types/schema";
import { bigram, trigram } from "n-gram";
import TinySegmenter from "tiny-segmenter";
import moji from "moji";
import { enhancedFetch } from "@/utils/fetchWithRetry";

// 検索用の設定
const searchOptions: FuseModule.IFuseOptions<Course> = {
    keys: [
        {
            name: "name",
            weight: 0.5,
        },
        {
            name: "teachers",
            weight: 0.3,
        },
        {
            name: "id",
            weight: 0.2,
        },
    ],
    threshold: 0.2, // より厳密なマッチング
    includeScore: true,
    ignoreLocation: true,
    useExtendedSearch: true,
    minMatchCharLength: 2,
};

// サジェスト用の軽量な設定
const suggestOptions: FuseModule.IFuseOptions<Course> = {
    keys: ["name", "teachers"],
    threshold: 0.4, // より寛容なマッチング
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 1,
};

interface SuggestionResult {
    text: string;
    score: number | undefined;
    details?: {
        teachers?: string;
        campus?: string;
        classCode?: string;
    };
}

// インスタンスのキャッシュ
interface FuseInstances {
    search: FuseModule.default<Course> | null;
    suggest: FuseModule.default<Course> | null;
}

const fuseInstances: FuseInstances = {
    search: null,
    suggest: null,
};

// データ処理の完了状態を追跡
const initializationPromises: {
    search: Promise<FuseModule.default<Course>> | null;
    suggest: Promise<FuseModule.default<Course>> | null;
} = {
    search: null,
    suggest: null,
};

function normalizeText(text: string): string {
    return moji(text)
        .convert("ZE", "HE") // 全角英数字→半角
        .convert("ZS", "HS") // 全角スペース→半角
        .toString()
        .toLowerCase();
}

// Tokenization using tiny-segmenter and n-gram
function tokenize(
    text: string,
    mode: "search" | "suggest" = "search"
): string[] {
    const normalized = normalizeText(text);
    const segmenter = new TinySegmenter();

    // Get words using TinySegmenter
    const words = segmenter.segment(normalized);

    // English word handling
    const englishWords = normalized.match(/[a-z0-9]+/g) || [];

    if (mode === "suggest") {
        // サジェスト用は軽量化のため、分かち書きと英単語のみを使用
        return [...new Set([...words, ...englishWords])];
    }

    // 検索用はより正確な結果のため、bigramも使用（trigramは省略）
    const bigrams = bigram(normalized);

    // 2文字以上の漢字熟語のみ文字分割（1文字は分かち書きに含まれる）
    const kanjiCompounds = words.filter(
        (word) => word.length > 1 && /^[\u4E00-\u9FFF]+$/.test(word)
    );
    const kanjiChars = kanjiCompounds.flatMap((word) => word.split(""));

    return [...new Set([...words, ...bigrams, ...kanjiChars, ...englishWords])];
}

// Helper function to parse course ID parts
function parseClassCode(id: string): string {
    if (id.length === 14) {
        return `1${id.substring(5, 7)}`;
    }
    return id.split("-")[0];
}

// Initialize Fuse.js instance with built index
async function initializeFuse(
    courses: Course[],
    type: "search" | "suggest" = "search"
): Promise<FuseModule.default<Course>> {
    // 既存のインスタンスがあればそれを返す
    if (fuseInstances[type]) {
        return fuseInstances[type]!;
    }

    // 初期化が進行中ならその Promise を返す
    if (initializationPromises[type]) {
        return initializationPromises[type]!;
    }

    // 新しく初期化を開始
    const options = type === "search" ? searchOptions : suggestOptions;

    // Promise を作成して保存
    initializationPromises[type] = new Promise<FuseModule.default<Course>>(
        (resolve) => {
            // インデックスを直接構築
            console.log(`Initializing ${type} Fuse instance`);
            const fuse = new FuseModule.default(courses, options);
            fuseInstances[type] = fuse;
            console.log(`${type} Fuse instance initialized`);
            resolve(fuse);
        }
    );

    return initializationPromises[type]!;
}

// アプリケーションの初期化時に呼び出す関数
export async function preloadSearchIndices(courses: Course[]): Promise<void> {
    console.log("Preloading search indices");
    try {
        // バックグラウンドで両方のインデックスを初期化
        await Promise.all([
            initializeFuse(courses, "suggest"),
            initializeFuse(courses, "search"),
        ]);
        console.log("Search indices preloaded");
    } catch (error) {
        console.error("Error preloading search indices:", error);
        // エラーが発生しても続行できるようにする
    }
}

// APIからデータを取得する関数
export async function fetchCourseData(
    year: string,
    semester: string
): Promise<Course[]> {
    try {
        const url = `https://catalog.sp.omu.ac.jp/api/search.json?year=${year}&semesters=${semester}`;
        console.log(`Fetching course data from: ${url}`);

        const response = await enhancedFetch(url, {
            retries: 3,
            retryDelay: 1500,
            timeout: 15000,
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Successfully fetched ${data.length} courses`);
        return data;
    } catch (error) {
        console.error("Failed to fetch course data:", error);
        throw error;
    }
}

export const search = async (query: SearchQuery, courses: Course[]) => {
    console.log("Starting search with params:", query);
    console.log("Initial courses count:", courses.length);

    // Initialize or get Fuse instance
    const fuse = await initializeFuse(courses);
    let results = courses;

    // Build Fuse.js search patterns with tokenization
    const searchPatterns: { $or: { [key: string]: string }[] }[] = [];
    if (query.course?.trim()) {
        const courseTokens = tokenize(query.course.trim());
        searchPatterns.push({
            $or: courseTokens.map((token) => ({ name: token })),
        });
    }
    if (query.teacher?.trim()) {
        // Split teacher names and tokenize each
        const teachers = query.teacher.trim().split("、");
        teachers.forEach((teacher) => {
            const teacherTokens = tokenize(teacher.trim());
            searchPatterns.push({
                $or: teacherTokens.map((token) => ({ teachers: token })),
            });
        });
    }

    // Perform initial fuzzy search if there are any patterns
    if (searchPatterns.length > 0) {
        console.log("Applying search patterns:", searchPatterns);
        const searchResults = fuse.search({ $and: searchPatterns });
        results = searchResults.map((result) => result.item);
        console.log("Results after text search:", results.length);
    }

    // Apply additional filters
    results = results.filter((course) => {
        // Campus filter
        if (query.campus && course.campus !== query.campus) {
            return false;
        }

        // Year and semester filter
        if (query.year && query.semester) {
            const courseId = course.id;
            // Extract year and semester from course ID (e.g., "20241KDA040001")
            const courseYear = courseId.substring(0, 4);
            const courseSemester = courseId.substring(4, 5);
            if (
                courseYear !== query.year ||
                courseSemester !== query.semester
            ) {
                return false;
            }
        }

        // Class code filter
        if (query.class_code?.trim()) {
            const courseClassCode = parseClassCode(course.id);
            console.log("Comparing class codes:", {
                courseId: course.id,
                parsedCourseCode: courseClassCode,
                queryCode: query.class_code.trim(),
                matches: courseClassCode === query.class_code.trim(),
            });
            if (courseClassCode !== query.class_code.trim()) {
                return false;
            }
        }

        return true;
    });

    console.log("Final results count:", results.length);
    if (results.length > 0) {
        console.log(
            "Sample results:",
            results.slice(0, 3).map((r) => ({
                id: r.id,
                name: r.name,
                classCode: parseClassCode(r.id),
            }))
        );
    }

    return results;
};

// Helper function to get campus name
const getCampusName = (campus: string): string => {
    const campusMap: { [key: string]: string } = {
        "0": "中百舌鳥",
        "1": "杉本",
        "2": "遠隔",
        "3": "その他",
    };
    return campusMap[campus] || campus;
};

// Autocomplete function for suggestions
export const getAutocompleteSuggestions = async (
    searchText: string,
    courses: Course[],
    field: "course" | "teacher",
    limit = 5
): Promise<SuggestionResult[]> => {
    if (!searchText.trim()) return [];

    // Initialize Fuse instance
    const fuse = await initializeFuse(courses);

    if (field === "teacher") {
        // Create a list of all unique teachers with their course details
        const teacherMap = new Map<
            string,
            {
                courses: Set<string>;
                campuses: Set<string>;
                classCodes: Set<string>;
            }
        >();

        courses.forEach((course) => {
            if (!course.teachers) return;
            const teacherTokens = tokenize(course.teachers);
            const teacher = course.teachers;

            if (!teacherMap.has(teacher)) {
                teacherMap.set(teacher, {
                    courses: new Set(),
                    campuses: new Set(),
                    classCodes: new Set(),
                });
            }
            const teacherInfo = teacherMap.get(teacher)!;
            teacherInfo.courses.add(course.name);
            teacherInfo.campuses.add(course.campus);
            teacherInfo.classCodes.add(parseClassCode(course.id));
        });

        const searchTokens = tokenize(searchText);
        const searchPattern = {
            $or: searchTokens.map((token) => ({ teachers: token })),
        };

        const searchResults = fuse.search(searchPattern);
        const teacherResults = new Map<string, SuggestionResult>();

        searchResults.forEach((result) => {
            const teacher = result.item.teachers;
            if (teacher && !teacherResults.has(teacher)) {
                const teacherInfo = teacherMap.get(teacher);
                if (teacherInfo) {
                    teacherResults.set(teacher, {
                        text: teacher,
                        score: result.score,
                        details: {
                            campus: Array.from(teacherInfo.campuses)
                                .map(getCampusName)
                                .join("・"),
                            classCode: Array.from(teacherInfo.classCodes).join(
                                "・"
                            ),
                        },
                    });
                }
            }
        });

        return Array.from(teacherResults.values())
            .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
            .slice(0, limit);
    } else {
        // For course suggestions
        const searchTokens = tokenize(searchText);
        const searchPattern = {
            $or: searchTokens.map((token) => ({ name: token })),
        };

        const searchResults = fuse.search(searchPattern);
        const courseResults = new Map<string, SuggestionResult>();

        searchResults.forEach((result) => {
            const course = result.item;
            if (!courseResults.has(course.name)) {
                courseResults.set(course.name, {
                    text: course.name,
                    score: result.score,
                    details: {
                        teachers: course.teachers,
                        campus: getCampusName(course.campus),
                        classCode: parseClassCode(course.id),
                    },
                });
            }
        });

        return Array.from(courseResults.values())
            .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
            .slice(0, limit);
    }
};
