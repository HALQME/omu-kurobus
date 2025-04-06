import React, { useState, useEffect, useMemo } from "react";
import { getFavorites, getCourse, removeFavorite } from "@/utils/store";
import { actions } from "astro:actions";

export const FavoriteCourses: React.FC = () => {
    // お気に入りリストを状態として管理
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    // フィルタリング用の状態
    const [selectedYear, setSelectedYear] = useState<string>("all");
    const [selectedSemester, setSelectedSemester] = useState<string>("all"); // all, 前期, 後期

    // コンポーネントマウント時にお気に入りを取得
    useEffect(() => {
        setFavorites(getFavorites());
        console.log("お気に入りリスト:", getFavorites());
    }, []);

    // 全てのお気に入り授業を取得
    const allFavoriteCourses = useMemo(() => {
        return favorites.map((id) => getCourse(id)).filter(Boolean);
    }, [favorites]);

    // 利用可能な年度と学期を抽出
    const { years, semesters } = useMemo(() => {
        const yearsSet = new Set<string>();
        const semestersSet = new Set<string>();

        allFavoriteCourses.forEach((course) => {
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
            years: Array.from(yearsSet).sort().reverse(), // 新しい年度順
            semesters: Array.from(semestersSet),
        };
    }, [allFavoriteCourses]);

    // フィルタリングされたお気に入り授業
    const filteredFavoriteCourses = useMemo(() => {
        return allFavoriteCourses.filter((course) => {
            if (!course.semester) return false;

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
    }, [allFavoriteCourses, selectedYear, selectedSemester]);

    // 年度・学期でグループ分けされたお気に入り授業
    const groupedCourses = useMemo(() => {
        const groups: Record<string, typeof allFavoriteCourses> = {};

        filteredFavoriteCourses.forEach((course) => {
            if (course.semester) {
                if (!groups[course.semester]) {
                    groups[course.semester] = [];
                }
                groups[course.semester].push(course);
            }
        });

        // グループを年度と学期でソート
        return Object.entries(groups).sort(([semA], [semB]) => {
            const yearA = semA.slice(0, 4);
            const yearB = semB.slice(0, 4);

            if (yearA !== yearB) {
                return parseInt(yearB) - parseInt(yearA); // 新しい年度順
            }

            // 同じ年度なら前期を先に
            return semA.includes("前期") ? -1 : 1;
        });
    }, [filteredFavoriteCourses]);

    // 取り消しボタンのクリックハンドラ
    const handleRemoveFavorite = async (
        event: React.FormEvent<HTMLFormElement>,
        courseId: string
    ) => {
        event.preventDefault();
        setIsLoading({ ...isLoading, [courseId]: true });

        try {
            // フォームデータ取得とAPIアクション呼び出し
            const formData = new FormData(event.currentTarget);
            await actions.course.removeFavorite(formData);

            // ローカルストアからも削除
            removeFavorite(courseId);

            // 状態を更新して再レンダリング
            setFavorites(getFavorites());
        } catch (error) {
            console.error("Failed to remove favorite:", error);
        } finally {
            setIsLoading({ ...isLoading, [courseId]: false });
        }
    };

    if (allFavoriteCourses.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 italic">
                お気に入りに登録した授業はありません
            </div>
        );
    }

    return (
        <div className="favorite-courses">
            {/* フィルタリングコントロール */}
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

            {/* フィルター結果カウント */}
            <div className="mb-5">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-2 px-4 rounded-lg inline-block">
                    <span className="text-blue-600 dark:text-blue-400 font-bold mr-1">
                        {filteredFavoriteCourses.length}
                    </span>
                    件の授業が見つかりました
                </p>
            </div>

            {/* 学期ごとにグループ化された授業一覧 */}
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
                                        action={actions.course.removeFavorite}
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
                                            className={`w-full text-red-500 hover:text-white border border-red-300 hover:bg-red-600 text-sm px-3 py-1.5 rounded-md dark:border-red-700 dark:hover:bg-red-700 transition-colors ${
                                                isLoading[course.id]
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {isLoading[course.id] ? (
                                                <span className="flex items-center justify-center">
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500"
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
                                                    処理中...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center">
                                                    <svg
                                                        className="w-4 h-4 mr-1.5"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        ></path>
                                                    </svg>
                                                    お気に入りから削除
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}

            {allFavoriteCourses.length > 0 &&
                filteredFavoriteCourses.length === 0 && (
                    <div className="mt-8 p-6 text-center">
                        <button
                            onClick={() => {
                                setSelectedYear("all");
                                setSelectedSemester("all");
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            すべての授業を表示
                        </button>
                    </div>
                )}
        </div>
    );
};

export default FavoriteCourses;
