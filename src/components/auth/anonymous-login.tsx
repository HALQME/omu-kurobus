import { useEffect, useState, useCallback } from "react";
import { authClient, getAuthStatus } from "@/lib/auth-client";

type AnonymousLoginProps = {
    onLoginComplete?: () => void;
    skipIfAuthenticated?: boolean; // すでに認証済みの場合はスキップするオプション
};

export const AnonymousLogin: React.FC<AnonymousLoginProps> = ({
    onLoginComplete,
    skipIfAuthenticated = true,
}) => {
    const [status, setStatus] = useState<{
        isLoading: boolean;
        isError: boolean;
        errorMessage: string | null;
        completed: boolean;
    }>({
        isLoading: false,
        isError: false,
        errorMessage: null,
        completed: false,
    });

    const performAnonymousLogin = useCallback(async () => {
        if (status.isLoading || status.completed) return;

        setStatus((prev) => ({
            ...prev,
            isLoading: true,
            isError: false,
            errorMessage: null,
        }));

        try {
            // まず現在の認証状態を確認
            if (skipIfAuthenticated) {
                const authStatus = await getAuthStatus();

                if (authStatus.isAuthenticated) {
                    setStatus((prev) => ({
                        ...prev,
                        isLoading: false,
                        completed: true,
                    }));
                    onLoginComplete?.();
                    return;
                }
            }

            // 匿名ログインを実行
            await authClient.signIn.anonymous();

            setStatus((prev) => ({
                ...prev,
                isLoading: false,
                completed: true,
            }));

            onLoginComplete?.();
        } catch (error) {
            console.error("匿名ログイン処理中にエラーが発生しました:", error);
            setStatus((prev) => ({
                ...prev,
                isLoading: false,
                isError: true,
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : "匿名ログインに失敗しました",
            }));
        }
    }, [
        skipIfAuthenticated,
        status.isLoading,
        status.completed,
        onLoginComplete,
    ]);

    // コンポーネントマウント時に一度だけ実行
    useEffect(() => {
        performAnonymousLogin();
    }, [performAnonymousLogin]);

    // エラーが発生した場合のみ表示
    if (status.isError) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm mb-2">
                    匿名ログインエラー: {status.errorMessage}
                </p>
                <button
                    onClick={performAnonymousLogin}
                    className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                    disabled={status.isLoading}
                >
                    {status.isLoading ? "再試行中..." : "再試行"}
                </button>
            </div>
        );
    }

    // 通常は何も表示しない（サイレント認証）
    return null;
};

export default AnonymousLogin;
