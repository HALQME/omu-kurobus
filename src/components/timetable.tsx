import { useEffect, useState, useRef } from "react";
import { getFavorites } from "@/utils/store";
import { DetailCourseSchema, type DetailCourse } from "@/types/schema";
import * as htmlToImage from "html-to-image";

interface TimetableProps {
    semester: "0" | "1";
    year: string; // 必須パラメータに変更
}

function CourseCard({ course }: { course: DetailCourse }) {
    return (
        <div className="text-xs sm:text-sm group h-full">
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md backdrop-blur-sm transition-all duration-300 p-2 h-full border border-pink-100/50 dark:border-pink-500/20 group-hover:border-pink-200 dark:group-hover:border-pink-500/30 flex flex-col justify-between overflow-y-auto"
                role="article"
                aria-label={`${course.name} 講義情報`}
            >
                <a
                    href={`search/${course.year}/${
                        course.semester === "前期" ? "0" : "1"
                    }/${course.id}`}
                    className="flex flex-col h-full justify-between"
                >
                    <div>
                        <p className="font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent mb-1.5 break-words whitespace-normal hyphens-auto">
                            {course.name}
                        </p>
                    </div>
                    <div className="space-y-1 mt-auto">
                        <p
                            className="text-gray-700 dark:text-gray-200 text-[9px] sm:text-xs flex items-center gap-1 line-clamp-1"
                            title={course.teachers.join(", ")}
                        >
                            <span
                                className="text-pink-500 dark:text-pink-400 flex-shrink-0"
                                aria-hidden="true"
                            >
                                👥
                            </span>
                            <span className="overflow-hidden text-ellipsis">
                                {course.teachers.length > 1
                                    ? `${course.teachers.slice(0, 1)} ...`
                                    : course.teachers}
                            </span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-[9px] sm:text-xs flex items-center gap-1">
                            <span
                                className="text-violet-500 dark:text-violet-400 flex-shrink-0"
                                aria-hidden="true"
                            >
                                🎓
                            </span>
                            <span className="overflow-hidden text-ellipsis line-clamp-1">
                                {course.campus}
                            </span>
                        </p>
                    </div>
                </a>
            </div>
        </div>
    );
}

// 集中講義用の専用カードコンポーネント
function IntensiveCourseCard({ course }: { course: DetailCourse }) {
    return (
        <div className="text-xs group h-full">
            <div
                className="min-w-20 bg-gradient-to-br from-pink-50 to-violet-50 dark:from-pink-900/20 dark:to-violet-900/20 rounded-lg shadow-sm hover:shadow-md backdrop-blur-sm transition-all duration-300 h-full border border-pink-200/70 dark:border-pink-500/30 group-hover:border-pink-300 dark:group-hover:border-pink-500/50 flex flex-col justify-between overflow-y-auto p-3"
                role="article"
                aria-label={`${course.name} 集中講義情報`}
            >
                <a
                    href={`search/${course.year}/${
                        course.semester === "前期" ? "0" : "1"
                    }/${course.id}`}
                    className="flex flex-col h-full justify-between"
                >
                    <div>
                        <p className="font-bold text-xs bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent break-words whitespace-normal hyphens-auto mb-2">
                            {course.name}
                        </p>
                    </div>
                    <div className="space-y-0.5 mt-auto">
                        <p
                            className="text-gray-700 dark:text-gray-200 flex items-center gap-1"
                            title={course.teachers.join(", ")}
                        >
                            <span
                                className="text-pink-500 dark:text-pink-400 flex-shrink-0"
                                aria-hidden="true"
                            >
                                👥
                            </span>
                            <span className="overflow-hidden text-ellipsis">
                                {course.teachers.length > 1
                                    ? `${course.teachers.slice(0, 1)} ...`
                                    : course.teachers}
                            </span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                            <span
                                className="text-violet-500 dark:text-violet-400 flex-shrink-0"
                                aria-hidden="true"
                            >
                                🎓
                            </span>
                            <span className="overflow-hidden text-ellipsis line-clamp-1">
                                {course.campus}
                            </span>
                        </p>
                    </div>
                </a>
            </div>
        </div>
    );
}

export default function TimeTable({ semester, year }: TimetableProps) {
    const timetableRef = useRef<HTMLDivElement>(null);
    const [timetable, setTimetable] = useState<(DetailCourse | null)[][]>(
        Array(5)
            .fill(null)
            .map(() => Array(5).fill(null))
    );
    const [intensiveCourses, setIntensiveCourses] = useState<DetailCourse[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    useEffect(() => {
        const fetchCourseData = async () => {
            setIsLoading(true);
            setError(null);
            const favorites = getFavorites();
            console.log("[Timetable] Semester:", semester);
            console.log("[Timetable] Year:", year);
            console.log("[Timetable] Favorites:", favorites);

            // 利用可能な年度を収集
            const years = [
                ...new Set(favorites.map((id: string) => id.substring(0, 4))),
            ];
            setAvailableYears(years.sort().reverse());

            try {
                const courseData = await Promise.all(
                    favorites.map(async (id: string) => {
                        const courseYear = id.substring(0, 4);

                        // 指定された年度と一致するもののみ取得
                        if (courseYear !== year) {
                            return null;
                        }

                        const url = `https://raw.githubusercontent.com/HALQME/omu-course-library/refs/heads/main/data/${courseYear}/${semester}/id/${id}.json`;

                        try {
                            const response = await fetch(url);
                            if (!response.ok) {
                                throw new Error(
                                    `HTTP error! status: ${response.status}`
                                );
                            }
                            const data = await response.json();
                            return DetailCourseSchema.parse(data);
                        } catch (error) {
                            console.error(
                                `[Timetable] Failed to fetch course data for ID: ${url}`,
                                error
                            );
                            return null;
                        }
                    })
                ).then((results) =>
                    results.filter(
                        (result): result is DetailCourse => result !== null
                    )
                );

                const newTimetable = Array(5)
                    .fill(null)
                    .map(() => Array(5).fill(null));
                const newIntensiveCourses: DetailCourse[] = [];

                courseData.forEach((course: DetailCourse) => {
                    course.period.forEach((periodInfo) => {
                        if (
                            periodInfo.semester ===
                            (semester === "0" ? "前期" : "後期")
                        ) {
                            console.log(periodInfo);
                            periodInfo.timetable.forEach((time) => {
                                const weekdayMap: Record<string, number> = {
                                    月曜日: 0,
                                    火曜日: 1,
                                    水曜日: 2,
                                    木曜日: 3,
                                    金曜日: 4,
                                };

                                if (time.weekday === "集中講義") {
                                    if (!newIntensiveCourses.includes(course)) {
                                        console.log(
                                            `[Timetable] Adding intensive course: ${course.name}`
                                        );
                                        newIntensiveCourses.push(course);
                                    }
                                    return;
                                }

                                const weekdayIndex = weekdayMap[time.weekday];
                                const periodIndex =
                                    parseInt(time.period.replace(/限$/, "")) -
                                    1;

                                if (
                                    weekdayIndex !== undefined &&
                                    periodIndex >= 0
                                ) {
                                    console.log(
                                        `[Timetable] Placing ${course.name} at [${periodIndex}][${weekdayIndex}]`
                                    );
                                    newTimetable[periodIndex][weekdayIndex] =
                                        course;
                                }
                            });
                        }
                    });
                });

                setTimetable(newTimetable);
                setIntensiveCourses(newIntensiveCourses);
            } catch (error) {
                console.error("[Timetable] Error fetching course data:", error);
                setError("時間割データの取得に失敗しました");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseData();
    }, [semester, year]); // yearが変更されたときにも再フェッチ

    const exportAsPng = async () => {
        if (!timetableRef.current) return;

        try {
            // 元の要素のスタイル状態を保存
            const originalStyles = {
                width: timetableRef.current.style.width,
                minWidth: timetableRef.current.style.minWidth,
                overflow: timetableRef.current.style.overflow,
                transform: timetableRef.current.style.transform,
                position: timetableRef.current.style.position,
            };

            // デスクトップサイズでレンダリングするための一時コンテナを作成
            const container = document.createElement("div");
            container.style.cssText = `
                position: absolute;
                left: -9999px;
                top: -9999px;
                width: 1024px; // デスクトップサイズ相当の固定幅
            `;
            document.body.appendChild(container);

            // 要素を一時的にコンテナに移動し、デスクトップ用スタイルを適用
            const parent = timetableRef.current.parentNode;
            container.appendChild(timetableRef.current);

            // デスクトップレンダリング用のスタイルを適用
            Object.assign(timetableRef.current.style, {
                width: "1000px",
                minWidth: "1000px",
                overflow: "visible",
                position: "relative",
            });

            // レンダリングが安定するのを少し待つ
            await new Promise((resolve) => setTimeout(resolve, 300));

            // 画像として出力
            const dataUrl = await htmlToImage.toPng(timetableRef.current, {
                quality: 1.0,
                pixelRatio: 2,
            });

            // 要素を元の親に戻し、元のスタイルを復元
            if (parent) {
                parent.appendChild(timetableRef.current);
            }
            Object.assign(timetableRef.current.style, originalStyles);

            // コンテナを削除
            document.body.removeChild(container);

            // ダウンロードリンクを作成
            const link = document.createElement("a");
            const date = new Date().toISOString().split("T")[0];
            link.download = `時間割表_${year}_${
                semester === "0" ? "前期" : "後期"
            }_${date}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("PNG出力中にエラーが発生しました", error);
        }
    };

    const weekdays = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日"];
    const periods = ["1", "2", "3", "4", "5"];

    return (
        <div className="w-full">
            {isLoading ? (
                <div
                    className="text-center py-8 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent animate-pulse"
                    role="status"
                    aria-live="polite"
                >
                    <div
                        className="inline-block w-6 h-6 border-2 border-current border-r-transparent rounded-full animate-spin mr-2"
                        aria-hidden="true"
                    ></div>
                    読み込み中...
                </div>
            ) : error ? (
                <div
                    className="text-red-600 dark:text-red-400 text-center py-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/20"
                    role="alert"
                    aria-live="assertive"
                >
                    {error}
                </div>
            ) : (
                <div className="space-y-4">
                    <div
                        ref={timetableRef}
                        className="timetable-container bg-white dark:bg-gray-800 rounded-2xl p-2 sm:p-4 backdrop-blur-sm border border-pink-100/50 dark:border-pink-500/10"
                    >
                        <div className="overflow-x-auto sm:overflow-visible">
                            <div className="inline-block min-w-full align-middle">
                                <table
                                    className="w-full table-fixed border-separate border-spacing-1 sm:border-spacing-2"
                                    role="grid"
                                    aria-label="時間割表"
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                className="bg-transparent p-1 sm:p-2 rounded-xl text-center backdrop-blur-sm w-8 sm:w-12"
                                                scope="col"
                                            ></th>
                                            {weekdays.map((weekday) => (
                                                <th
                                                    key={weekday}
                                                    className="bg-white dark:bg-gray-700/80 p-1 sm:p-2 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 rounded-xl backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md w-[100px] sm:w-[105px] md:w-[130px]"
                                                >
                                                    {weekday}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {periods.map((period, i) => (
                                            <tr key={period}>
                                                <th
                                                    scope="row"
                                                    className="bg-white dark:bg-gray-700/80 p-1 sm:p-2 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 rounded-xl backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md text-center"
                                                >
                                                    {period}
                                                </th>
                                                {timetable[i].map(
                                                    (course, j) => (
                                                        <td
                                                            key={`${i}-${j}`}
                                                            className="w-[90px] sm:w-[120px] md:w-[150px] p-1 align-top h-[8rem] sm:h-[9rem]"
                                                        >
                                                            {course && (
                                                                <CourseCard
                                                                    course={
                                                                        course
                                                                    }
                                                                />
                                                            )}
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {intensiveCourses.length > 0 && (
                            <div className="mt-6 px-2">
                                <h3 className="text-base sm:text-lg font-bold mb-3 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent flex items-center">
                                    <span
                                        className="mr-2 text-xl"
                                        aria-hidden="true"
                                    >
                                        ✨
                                    </span>
                                    集中講義
                                </h3>
                                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                    {intensiveCourses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="transition-all duration-300 h-[6rem] sm:h-[7rem]"
                                        >
                                            <IntensiveCourseCard
                                                course={course}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-4 mb-6">
                        <button
                            onClick={exportAsPng}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm"
                            aria-label="時間割表をPNG画像として出力"
                        >
                            <span aria-hidden="true">📷</span>
                            PNG出力
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
