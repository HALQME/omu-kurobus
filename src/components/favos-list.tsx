import React, { useState, useEffect, useMemo } from "react";
import {
    getFavorites,
    removeFavorite,
    addFavorite,
    clearFavorites,
} from "@/utils/store";
import { actions } from "astro:actions";
import {
    getFavCourses,
    removeFavCourse,
    setFavCourses,
    syncFavorites,
} from "@/utils/favos";
import { getCourseSummary } from "@/utils/fetch-course";
import type { CourseSummary } from "@/types/schema";

interface FavoriteCoursesProps {
    userId: string;
}

export const FavoriteCourses: React.FC<FavoriteCoursesProps> = ({ userId }) => {
    const [courses, setCourses] = useState<CourseSummary[]>([]);
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [selectedYear, setSelectedYear] = useState<string>("all");
    const [selectedSemester, setSelectedSemester] = useState<string>("all");

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const favorites = await syncFavorites(userId);

                await setFavCourses(userId, favorites);

                const coursesData = await Promise.all(
                    favorites.map(async (id) => {
                        try {
                            const summaries = await getCourseSummary(id);
                            return summaries;
                        } catch (error) {
                            return [];
                        }
                    })
                ).then((res) => res.flat());

                setCourses(
                    coursesData.filter((c): c is CourseSummary => c !== null)
                );
            } catch (error) {
                console.error("Error loading favorite courses:", error);
            }
        };

        loadCourses();
    }, [userId]);

    const { years } = useMemo(() => {
        const yearsSet = new Set<string>();
        const semestersSet = new Set<string>();

        courses.forEach((course) => {
            if (course.semester) {
                const year = course.semester.slice(0, 4);
                const semester = course.semester.includes("前期")
                    ? "前期"
                    : "後期";

                yearsSet.add(year);
                semestersSet.add(semester);
            }
        });

        return {
            years: Array.from(yearsSet).sort().reverse(),
            semesters: Array.from(semestersSet),
        };
    }, [courses]);

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            if (!course?.semester) return false;

            const courseYear = course.semester.slice(0, 4);
            const courseSemester = course.semester.includes("前期")
                ? "前期"
                : "後期";

            const yearMatch =
                selectedYear === "all" || courseYear === selectedYear;
            const semesterMatch =
                selectedSemester === "all" ||
                courseSemester === selectedSemester;

            return yearMatch && semesterMatch;
        });
    }, [courses, selectedYear, selectedSemester]);

    const groupedCourses = useMemo(() => {
        const groups: Record<string, typeof courses> = {};

        filteredCourses.forEach((course) => {
            if (course?.semester) {
                if (!groups[course.semester]) {
                    groups[course.semester] = [];
                }
                groups[course.semester].push(course);
            }
        });

        return Object.entries(groups).sort(([semA], [semB]) => {
            const yearA = semA.slice(0, 4);
            const yearB = semB.slice(0, 4);
            if (yearA !== yearB) {
                return parseInt(yearB) - parseInt(yearA);
            }
            return semA.includes("前期") ? -1 : 1;
        });
    }, [filteredCourses]);

    const handleRemoveFavorite = async (
        event: React.FormEvent<HTMLFormElement>,
        courseId: string
    ) => {
        event.preventDefault();
        setIsLoading((prev) => ({ ...prev, [courseId]: true }));

        try {
            const formData = new FormData(event.currentTarget);
            await actions.course.removeFavorite(formData);

            await removeFavCourse(userId, courseId);
            removeFavorite(courseId);

            setCourses((prev) =>
                prev.filter((course) => course.id !== courseId)
            );
        } catch (error) {
            console.error("Failed to remove favorite:", error);
        } finally {
            setIsLoading((prev) => ({ ...prev, [courseId]: false }));
        }
    };

    if (!userId) {
        return (
            <div className="p-6 text-center text-gray-500 italic">
                ログインしてお気に入りを管理しましょう
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 italic">
                お気に入りに登録した授業はありません
            </div>
        );
    }

    return (
        <div className="favorite-courses">
            <div className="mb-6 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                    フィルター
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label
                            htmlFor="yearFilter"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            年度
                        </label>
                        <select
                            id="yearFilter"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            <option value="all">すべての年度</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}年度
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <fieldset>
                            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                学期
                            </legend>
                            <div className="flex gap-6">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="semester"
                                        value="all"
                                        checked={selectedSemester === "all"}
                                        onChange={() =>
                                            setSelectedSemester("all")
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                                        すべて
                                    </span>
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="semester"
                                        value="前期"
                                        checked={selectedSemester === "前期"}
                                        onChange={() =>
                                            setSelectedSemester("前期")
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                                        前期
                                    </span>
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="semester"
                                        value="後期"
                                        checked={selectedSemester === "後期"}
                                        onChange={() =>
                                            setSelectedSemester("後期")
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                                        後期
                                    </span>
                                </label>
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>

            <div className="mb-5">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-2 px-4 rounded-lg inline-block">
                    <span className="text-blue-600 dark:text-blue-400 font-bold mr-1">
                        {filteredCourses.length}
                    </span>
                    件の授業が見つかりました
                </p>
            </div>

            {groupedCourses.length === 0 ? (
                <div className="p-10 text-center text-gray-500 italic bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-lg">条件に一致する授業はありません</p>
                    <p className="text-sm mt-2">
                        フィルター条件を変更してお試しください
                    </p>
                </div>
            ) : (
                groupedCourses.map(([semester, courses]) => (
                    <div key={semester} className="mb-10">
                        <h3 className="text-lg font-semibold mb-5 pb-2 border-b-2 border-blue-500 dark:border-blue-400 flex items-center">
                            <span className="mr-2">
                                {semester.includes("前期") ? "🌸" : "🍁"}
                            </span>
                            {semester}
                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({courses.length}件)
                            </span>
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courses.map((course) => (
                                <li
                                    key={course.id}
                                    className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span
                                            className={`${
                                                course.semester?.includes(
                                                    "前期"
                                                )
                                                    ? "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200"
                                                    : "bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200"
                                            } text-xs px-2.5 py-1 rounded font-medium`}
                                        >
                                            {course.semester}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                            <span className="mr-1.5">📍</span>
                                            {course.campus}
                                            <span className="mx-1.5">|</span>
                                            <span className="mr-1">⏰</span>
                                            {course.period}
                                        </span>
                                    </div>

                                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 hover:line-clamp-none transition-all duration-200">
                                        <a
                                            href={`/search/${course.semester?.slice(
                                                0,
                                                4
                                            )}/${
                                                course.semester?.includes(
                                                    "前期"
                                                )
                                                    ? "0"
                                                    : "1"
                                            }/${course.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {course.name}
                                        </a>
                                    </h4>

                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 flex-grow">
                                        {course.teachers &&
                                        course.teachers.length > 30
                                            ? `${course.teachers.substring(
                                                  0,
                                                  30
                                              )}...`
                                            : course.teachers}
                                    </p>

                                    <form
                                        method="POST"
                                        onSubmit={(e) =>
                                            handleRemoveFavorite(e, course.id)
                                        }
                                        className="mt-auto"
                                    >
                                        <input
                                            type="hidden"
                                            name="course_id"
                                            value={course.id}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading[course.id]}
                                            className={`w-full text-red-500 dark:text-red-300 hover:text-white border border-red-300 hover:bg-red-600 text-sm px-3 py-1.5 rounded-md dark:border-red-400 dark:hover:bg-red-400 transition-colors ${
                                                isLoading[course.id]
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            title="お気に入りから削除"
                                        >
                                            <span className="flex items-center justify-center">
                                                {isLoading[course.id] ? (
                                                    <svg
                                                        className="animate-spin h-5 w-5"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <svg
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            ></path>
                                                        </svg>
                                                        お気に入りから削除
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    </form>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
};

export default FavoriteCourses;
