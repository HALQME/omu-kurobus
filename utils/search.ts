import Fuse from "fuse.js";
import { type SearchQuery, type Course } from "@/types/schema";

const fuseOptions = {
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

// Interface for suggestion results
interface SuggestionResult {
    text: string;
    score: number | undefined;
    details?: {
        teachers?: string;
        campus?: string;
        classCode?: string;
    };
}

// Helper function to parse course ID parts
function parseClassCode(id: string): string {
    if (id.length === 14) {
        return `1${id.substring(5, 7)}`;
    }
    return id.split("-")[0];
}

export const search = async (query: SearchQuery, courses: Course[]) => {
    console.log("Starting search with params:", query);
    console.log("Initial courses count:", courses.length);

    const fuse = new Fuse(courses, fuseOptions);
    let results = courses;

    // Build Fuse.js search patterns
    const searchPatterns: string[] = [];
    if (query.course?.trim()) {
        searchPatterns.push(query.course.trim());
    }
    if (query.teacher?.trim()) {
        // Split teacher names and search for each
        const teachers = query.teacher.trim().split("、");
        teachers.forEach((teacher) => {
            searchPatterns.push(`="^${teacher.trim()}$"`);
        });
    }

    // Perform initial fuzzy search if there are any patterns
    if (searchPatterns.length > 0) {
        console.log("Applying search patterns:", searchPatterns);
        const searchResults = fuse.search(searchPatterns.join(" "));
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

// Helper function to extract individual teachers from a comma-separated string
const extractTeachers = (teachersString: string): string[] => {
    return teachersString
        .split("、")
        .map((t) => t.trim())
        .filter(Boolean);
};

// Helper function to normalize course name (remove variations that should be considered the same)
const normalizeName = (name: string): string => {
    return name.replace(/[\s　]+/g, " ").trim();
};

// Helper function to adjust search score based on course properties
const adjustScore = (score: number | undefined, name: string): number => {
    if (score === undefined) return 1;
    // Penalize courses with "再履修" in their name
    if (name.includes("再履修")) {
        return score + 0.3;
    }
    return score;
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
export const getAutocompleteSuggestions = (
    searchText: string,
    courses: Course[],
    field: "course" | "teacher",
    limit = 5
): SuggestionResult[] => {
    if (!searchText.trim()) return [];

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
            const teachers = extractTeachers(course.teachers);
            teachers.forEach((teacher) => {
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
        });

        const teacherArray = Array.from(teacherMap.entries());
        const fuse = new Fuse(teacherArray, {
            keys: ["0"], // Search on teacher name (first element of entry)
            threshold: 0.3,
            includeScore: true,
        });

        const searchResults = fuse.search(searchText);
        return searchResults.slice(0, limit).map((result) => ({
            text: result.item[0], // Teacher name
            score: result.score,
            details: {
                // Format details about all courses taught by this teacher
                campus: Array.from(result.item[1].campuses)
                    .map(getCampusName)
                    .join("・"),
                classCode: Array.from(result.item[1].classCodes).join("・"),
            },
        }));
    } else {
        // For course suggestions, create a unique list of course names with their details
        const courseNameMap = new Map<
            string,
            { course: Course; score: number | undefined }
        >();

        const fuse = new Fuse(courses, {
            keys: ["name"],
            threshold: 0.3,
            includeScore: true,
        });

        const searchResults = fuse.search(searchText);

        // Process results to keep only unique course names with best scores
        searchResults.forEach((result) => {
            const normalizedName = normalizeName(result.item.name);
            const adjustedScore = adjustScore(result.score, result.item.name);

            if (
                !courseNameMap.has(normalizedName) ||
                (courseNameMap.get(normalizedName)?.score ?? 1) > adjustedScore
            ) {
                courseNameMap.set(normalizedName, {
                    course: result.item,
                    score: adjustedScore,
                });
            }
        });

        // Convert map to array and sort by score
        return Array.from(courseNameMap.values())
            .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
            .slice(0, limit)
            .map(({ course, score }) => ({
                text: course.name,
                score: score,
                details: {
                    teachers: course.teachers,
                    campus: getCampusName(course.campus),
                    classCode: course.id.split("-")[0],
                },
            }));
    }
};
