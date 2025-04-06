import { useState, useEffect } from "react";
import { authClient, getAuthStatus } from "@/lib/auth-client";

interface PasskeySignupProps {
    onSignupComplete?: () => void;
    onCancel?: () => void;
}

export const PasskeySignup: React.FC<PasskeySignupProps> = ({
    onSignupComplete,
    onCancel,
}) => {
    // 状態管理
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authStatus, setAuthStatus] = useState<{
        isAuthenticated: boolean;
        isAnonymous: boolean;
    }>({ isAuthenticated: false, isAnonymous: false });

    // 認証状態を取得
    useEffect(() => {
        const checkAuthStatus = async () => {
            const status = await getAuthStatus();
            setAuthStatus({
                isAuthenticated: status.isAuthenticated,
                isAnonymous: status.isAnonymous,
            });
        };

        checkAuthStatus();
    }, []);

    // パスキー登録処理
    const handlePasskeySignup = async () => {
        if (!name.trim()) {
            setError("デバイス名を入力してください");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // 匿名ユーザーのセッションを取得
            const { data: anonymousSession } = await authClient.getSession();
            console.log("anonymousSession", anonymousSession?.session);

            if (!anonymousSession?.session?.id) {
                throw new Error("有効なセッションが見つかりません");
            }

            console.log("パスキー登録を開始します");

            await authClient.passkey.addPasskey({
                name: name.trim(),
                fetchOptions: {
                    body: {
                        create: true, // 新規作成モード
                        migrateData: {
                            fromSessionId: anonymousSession.session.id,
                        },
                    },
                },
            });

            console.log("パスキー登録が完了しました");
            onSignupComplete?.();

            // 認証成功時の処理
            window.location.reload(); // セッションを更新するためにページをリロード
        } catch (err) {
            console.error("パスキー登録エラー:", err);

            const errorMessage =
                err instanceof Error ? err.message : "不明なエラー";

            // エラーメッセージをユーザーフレンドリーにする
            if (errorMessage.includes("already exists")) {
                setError("このデバイスはすでに登録されています");
            } else if (errorMessage.includes("not supported")) {
                setError("お使いのブラウザはパスキーをサポートしていません");
            } else if (errorMessage.includes("cancelled")) {
                setError("パスキー登録がキャンセルされました");
            } else {
                setError(`パスキーの登録に失敗しました: ${errorMessage}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // パスキー対応ブラウザかどうかをチェック
    useEffect(() => {
        const checkPasskeySupport = () => {
            const supported =
                window.PublicKeyCredential &&
                typeof window.PublicKeyCredential === "function" &&
                typeof window.PublicKeyCredential
                    .isUserVerifyingPlatformAuthenticatorAvailable ===
                    "function";

            if (!supported) {
                setError(
                    "お使いのブラウザはパスキー（WebAuthn）をサポートしていません"
                );
            }
        };

        checkPasskeySupport();
    }, []);

    return (
        <div className="flex flex-col items-center gap-4 p-3 bg-white dark:bg-gray-800 max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                パスキーを登録
            </h2>

            {error && (
                <div className="w-full p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-red-700 dark:text-red-300 text-sm">
                        {error}
                    </p>
                </div>
            )}

            {!authStatus.isAnonymous && !authStatus.isAuthenticated && (
                <div className="w-full p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        ログイン状態が確認できないか、登録が許可されていません。
                        しばらく経ってからやりなおしてください。
                    </p>
                </div>
            )}

            <div className="w-full">
                <label
                    htmlFor="device-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    デバイス名
                </label>
                <input
                    id="device-name"
                    type="text"
                    placeholder="このデバイスの名前を入力"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    例: マイiPhone、職場のPC など
                </p>
            </div>

            <div className="flex flex-row gap-3 w-full mt-2">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                >
                    キャンセル
                </button>
                <button
                    onClick={handlePasskeySignup}
                    disabled={
                        isLoading ||
                        !name.trim() ||
                        (!authStatus.isAnonymous && !authStatus.isAuthenticated)
                    }
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        "パスキーを登録"
                    )}
                </button>
            </div>
        </div>
    );
};

export default PasskeySignup;
