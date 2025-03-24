import moji from "moji";
import { trigram } from "n-gram";
import TinySegmenter from "tiny-segmenter";

const segmenter = new TinySegmenter();

/**
 * 文字列の正規化と不要な記号の除去を行う
 * @param text 入力テキスト
 * @returns 正規化されたテキスト
 */
function normalizeText(text: string): string {
    return text
        .normalize("NFKC") // Unicode正規化
        .replace(/[・〜ー−]/g, "") // 記号除去
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
            String.fromCharCode(s.charCodeAt(0) - 0xfee0)
        ) // 全角英数字を半角に
        .trim();
}

/**
 * テキストのトークン化を行う内部関数
 * @param text 入力テキスト
 * @param tokenizer トークン化方式 ("trigram" or "segmenter")
 * @returns トークン配列
 */
function _tokenize(text: string, tokenizer: "trigram" | "segmenter"): string[] {
    const normalizedText = normalizeText(text);
    if (tokenizer === "trigram") {
        return trigram(normalizedText);
    } else {
        return segmenter.segment(normalizedText);
    }
}

/**
 * テキストのトークン化と正規化を行う
 * @param text 入力テキスト
 * @param tokenizer トークン化方式
 * @returns 正規化されたトークン配列
 */
export function tokenize(
    text: string,
    tokenizer: "trigram" | "segmenter"
): string[] {
    const query = moji(text)
        .convert("HK", "ZK") // 半角カナ → 全角カナ
        .convert("ZS", "HS") // 全角スペース → 半角スペース
        .convert("ZE", "HE") // 全角英数 → 半角英数
        .toString();

    return _tokenize(query, tokenizer)
        .map((word: string) => {
            if (word === " " || !word) return null;
            return moji(word)
                .convert("HG", "KK") // ひらがな → カタカナ
                .toString()
                .toLowerCase();
        })
        .filter((v: string | null): v is string => v !== null);
}

/**
 * 検索用にテキストをエンコードする
 * @param text 入力テキスト
 * @returns エンコードされたテキスト
 */
export function encode(text: string): string {
    return moji(normalizeText(text))
        .convert("HK", "ZK") // 半角カナ → 全角カナ
        .convert("ZS", "HS") // 全角スペース → 半角スペース
        .convert("ZE", "HE") // 全角英数 → 半角英数
        .convert("HG", "KK") // ひらがな → カタカナ
        .toString()
        .toLowerCase();
}
