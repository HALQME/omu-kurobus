import React, { useState, useEffect } from "react";
import { getFavorites, getCourse, removeFavorite } from "@/utils/store";
import { actions } from "astro:actions";

export const FavoriteCourses: React.FC = () => {
    // お気に入りリストを状態として管理
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

    // コンポーネントマウント時にお気に入りを取得
    useEffect(() => {
        setFavorites(getFavorites());
    }, []);

    const favoriteCourses = favorites
        .map((id) => getCourse(id))
        .filter(Boolean);

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

    if (favoriteCourses.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 italic">
                お気に入りに登録した授業はありません
            </div>
        );
    }

    return (
        <div className="favorite-courses p-4">
            <ul className="space-y-4">
                {favoriteCourses.map((course) => (
                    <li
                        key={course.id}
                        className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                                    {course.semester}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {course.campus} | {course.period}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mt-1">
                                {course.name}
                            </h3>

                            <div className="flex items-center justify-between mt-1">
                                <p className="text-gray-600 text-sm">
                                    🧑‍🏫 {course.teachers}
                                </p>
                                <form
                                    action={actions.course.removeFavorite}
                                    onSubmit={(e) =>
                                        handleRemoveFavorite(e, course.id)
                                    }
                                >
                                    <input
                                        type="hidden"
                                        name="course_id"
                                        value={course.id}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading[course.id]}
                                        className={`text-red-500 hover:text-red-700 text-sm px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors ${
                                            isLoading[course.id]
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                    >
                                        {isLoading[course.id]
                                            ? "処理中..."
                                            : "お気に入りから削除"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FavoriteCourses;
