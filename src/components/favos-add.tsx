import React, { useState, useEffect } from "react";
import { addFavorite, isFavorite } from "@/utils/store";
import { actions } from "astro:actions";

interface FavosAddProps {
    courseId: string;
    initialCount?: number;
    initialStatus?: string;
}

export const FavosAdd: React.FC<FavosAddProps> = ({
    courseId,
    initialCount = 0,
    initialStatus,
}) => {
    const [count, setCount] = useState<number>(initialCount);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFavorited, setIsFavorited] = useState<boolean>(false);

    // 初期状態の設定
    useEffect(() => {
        setIsFavorited(isFavorite(courseId) || initialStatus === "success");
    }, [courseId, initialStatus]);

    const handleAddFavorite = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        if (isFavorited) return;

        setIsLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            const result = await actions.course.addFavorite(formData);

            if (!result.error) {
                // ローカルストアにも追加
                addFavorite(courseId);
                setIsFavorited(true);
                setCount((prevCount) => prevCount + 1);

                // アイコンのアニメーション
                const icon = document.querySelector(".favorite-icon");
                icon?.classList.add("animate-favorite");
                setTimeout(() => {
                    icon?.classList.remove("animate-favorite");
                }, 1000);
            }
        } catch (error) {
            console.error("Failed to add favorite:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-sm w-full transition-all hover:shadow-lg">
            <div className="flex items-center justify-center mb-4">
                <svg
                    className={`favorite-icon w-8 h-8 ${
                        isFavorited
                            ? "text-pink-500 fill-current"
                            : "text-gray-400 dark:text-gray-500"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            </div>
            <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
                この授業をお気に入り登録した人:
                <span className="font-bold text-blue-600 dark:text-blue-400">
                    {count}人
                </span>
            </p>
            <form
                method="POST"
                action={actions.course.addFavorite}
                onSubmit={handleAddFavorite}
                className="flex justify-center"
            >
                <input type="hidden" name="course_id" value={courseId} />
                <button
                    className={`favorite-button flex items-center justify-center gap-2 ${
                        isFavorited
                            ? "bg-pink-500"
                            : "bg-blue-500 hover:bg-blue-600"
                    } text-white font-bold py-2 px-4 rounded-full transition-all duration-300 ${
                        isFavorited || isLoading
                            ? "disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                            : ""
                    }`}
                    disabled={isFavorited || isLoading}
                >
                    <span className="favorite-text">
                        {isLoading
                            ? "追加中..."
                            : isFavorited
                            ? "お気に入り登録済み"
                            : "お気に入りに追加"}
                    </span>
                </button>
            </form>
        </div>
    );
};

export default FavosAdd;
