import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

import { migrateAccount } from "./_migrate-account";

interface PasskeySigninProps {
    onSignInSuccess?: () => void;
    onCancel?: () => void;
}

interface AuthStatus {
    isLoading: boolean;
    error: string | null;
    isSupported: boolean;
    success: boolean;
    stage: "initial" | "authenticating" | "success" | "error";
}

// 現在のユーザーIDを取得するためのヘルパー関数
const getCurrentUserId = async () => {
    try {
        const { data: session } = await authClient.getSession();
        return session?.user?.id || null;
    } catch (error) {
        return null;
    }
};

export function PasskeySignin({
    onSignInSuccess,
    onCancel,
}: PasskeySigninProps) {
    const [status, setStatus] = useState<AuthStatus>({
        isLoading: false,
        error: null,
        isSupported: true,
        success: false,
        stage: "initial",
    });

    useEffect(() => {
        if (
            !PublicKeyCredential.isConditionalMediationAvailable ||
            !PublicKeyCredential.isConditionalMediationAvailable()
        ) {
            return;
        }

        void authClient.signIn.passkey({ autoFill: true });
    }, []);

    useEffect(() => {
        const checkPasskeySupport = async () => {
            try {
                // WebAuthnサポートチェック
                if (
                    !window.PublicKeyCredential ||
                    typeof window.PublicKeyCredential !== "function"
                ) {
                    setStatus((prev) => ({ ...prev, isSupported: false }));
                    return;
                }

                // プラットフォーム認証器のサポートチェック
                const platformAuthSupported =
                    await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                if (!platformAuthSupported) {
                    console.warn(
                        "プラットフォーム認証器がサポートされていません。クロスプラットフォーム認証器を使用します。"
                    );
                }
            } catch (error) {
                console.error(
                    "パスキーサポートチェック中にエラーが発生しました:",
                    error
                );
                setStatus((prev) => ({ ...prev, isSupported: false }));
            }
        };

        checkPasskeySupport();
    }, []);

    const handlePasskeyLogin = async () => {
        setStatus((prev) => ({
            ...prev,
            isLoading: true,
            error: null,
            success: false,
            stage: "authenticating",
        }));

        try {
            const prevUserId = await getCurrentUserId();
            const result = await authClient.signIn.passkey();

            if (result && result.error) {
                // エラー処理
                const error = result.error;
                console.warn("パスキーサインインエラー:", error);

                if (error.message === "auth cancelled") {
                    setStatus((prev) => ({
                        ...prev,
                        error: "認証がキャンセルされました",
                        stage: "error",
                    }));
                } else if (error.message === "Challenge not found") {
                    setStatus((prev) => ({
                        ...prev,
                        error: "認証チャレンジの期限が切れました。もう一度お試しください",
                        stage: "error",
                    }));
                } else if (error.message?.includes("not found")) {
                    setStatus((prev) => ({
                        ...prev,
                        error: "パスキーが見つかりません。別のデバイスを試すか、新しいパスキーを登録してください",
                        stage: "error",
                    }));
                } else {
                    setStatus((prev) => ({
                        ...prev,
                        error: `認証エラー: ${error.message || "不明なエラー"}`,
                        stage: "error",
                    }));
                }
            } else {
                // 認証成功
                setStatus((prev) => ({
                    ...prev,
                    success: true,
                    stage: "success",
                }));

                const nextUserId = await getCurrentUserId();
                console.log("nextUserId", nextUserId);
                console.log("prevUserId", prevUserId);
                if (prevUserId && nextUserId && prevUserId !== nextUserId) {
                    console.log(
                        "ユーザーIDが変更されました。データ移行を開始します"
                    );
                    await migrateAccount(prevUserId, nextUserId);
                }

                // 成功メッセージを表示した後、少し遅延させてから遷移処理を実行
                setTimeout(() => {
                    if (onSignInSuccess) {
                        onSignInSuccess();
                    } else {
                        window.location.reload(); // デフォルトの動作
                    }
                }, 1500); // 1.5秒後に遷移
                return; // ここで終了して、finallyブロックでloadingをfalseにしないようにする
            }
        } catch (error) {
            setStatus((prev) => ({
                ...prev,
                error: error instanceof Error ? error.message : "不明なエラー",
                stage: "error",
            }));
        } finally {
            setStatus((prev) => ({ ...prev, isLoading: false }));
        }
    };

    const renderContent = () => {
        switch (status.stage) {
            case "authenticating":
                return (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                        <p className="text-blue-700 dark:text-blue-300">
                            デバイスの指示に従ってください
                        </p>
                    </div>
                );
            case "success":
                return (
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
                        <p className="text-green-700 dark:text-green-300 flex items-center">
                            <svg
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            認証成功
                        </p>
                    </div>
                );
            case "error":
                return (
                    status.error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-red-700 dark:text-red-300 flex items-center">
                                <svg
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                {status.error}
                            </p>
                        </div>
                    )
                );
            default:
                return null;
        }
    };

    const buttonBaseClass =
        "w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const primaryButtonClass = `${buttonBaseClass} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:focus:ring-offset-gray-800`;
    const secondaryButtonClass = `${buttonBaseClass} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`;
    const dangerButtonClass = `${buttonBaseClass} bg-red-500 text-white hover:bg-red-600 focus:ring-red-500`;

    // パスキー非対応ブラウザの場合の表示
    if (!status.isSupported) {
        return (
            <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md w-full">
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        お使いのブラウザはパスキー認証（WebAuthn）をサポートしていません。
                        Chrome、Safari、Firefox、Edgeなどの最新ブラウザをお使いください。
                    </p>
                </div>
                {onCancel && (
                    <button onClick={onCancel} className={secondaryButtonClass}>
                        戻る
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 p-3 bg-white dark:bg-gray-800 max-w-md rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                パスキーでサインイン
            </h2>

            {renderContent()}

            <button
                onClick={handlePasskeyLogin}
                disabled={status.isLoading || status.stage === "success"}
                className={primaryButtonClass}
            >
                {status.stage === "authenticating" ? (
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
                        認証中
                    </span>
                ) : (
                    "パスキーで続ける"
                )}
            </button>

            {onCancel && (
                <button onClick={onCancel} className={dangerButtonClass}>
                    キャンセル
                </button>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md w-full">
                <p className="mb-1 font-medium">
                    <strong>パスキーでサインイン</strong>
                    するには、お使いのデバイスの認証方法（指紋認証、顔認証など）を使用します。
                </p>
                <p>
                    パスキーが登録されていない場合は、先に「パスキーを登録」から新しいデバイスを追加してください。
                </p>
            </div>
        </div>
    );
}

export default PasskeySignin;
