import { authClient } from "@/lib/auth-client";

import { useState, useEffect } from "react";

const SignOut = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignOut = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await authClient.signOut();
            window.location.href = "/";
        } catch (err) {
            console.error("サインアウト中にエラーが発生しました:", err);
            setError("サインアウトに失敗しました。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                {isLoading ? "Signing out..." : "Sign Out"}
            </button>
            {error && <p>{error}</p>}
        </div>
    );
};
export default SignOut;
