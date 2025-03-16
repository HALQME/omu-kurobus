/**
 * 再試行機能付きのfetch関数
 * ネットワークエラーが発生した場合に指定回数まで再試行します
 */

interface FetchWithRetryOptions {
    retries?: number; // 最大再試行回数
    retryDelay?: number; // 再試行間の待機時間（ミリ秒）
    backoff?: boolean; // 指数関数的バックオフを使用するか
}

export async function fetchWithRetry(
    url: string,
    options?: RequestInit & FetchWithRetryOptions
): Promise<Response> {
    const {
        retries = 3,
        retryDelay = 1000,
        backoff = true,
        ...fetchOptions
    } = options || {};

    let lastError: Error = new Error("Unknown error occurred");

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fetch(url, fetchOptions);
        } catch (error) {
            console.warn(
                `API request failed (attempt ${attempt + 1}/${retries + 1})`,
                error
            );
            lastError = error as Error;

            if (attempt < retries) {
                // 再試行前に待機
                const delay = backoff
                    ? retryDelay * Math.pow(2, attempt) // 指数関数的バックオフ
                    : retryDelay;

                console.info(`Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw new Error(
        `Failed after ${retries + 1} attempts: ${lastError.message}`
    );
}

// タイムアウトつきのfetch
export async function fetchWithTimeout(
    url: string,
    options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
    const { timeout = 10000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        return await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

// すべての機能を組み合わせたfetch
export async function enhancedFetch(
    url: string,
    options?: RequestInit & FetchWithRetryOptions & { timeout?: number }
): Promise<Response> {
    const { timeout, ...restOptions } = options || {};

    return fetchWithRetry(url, {
        ...restOptions,
        // fetchWithTimeoutを使用
        ...(timeout && { timeout }),
    });
}
