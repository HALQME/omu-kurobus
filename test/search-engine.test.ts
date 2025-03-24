import { describe, expect, it } from "vitest";
import { tokenize, encode } from "@/utils/search-engine";

describe("Search Engine", () => {
    describe("tokenize", () => {
        it("handles basic Japanese text with TinySegmenter", () => {
            const input = "プログラミング入門";
            const tokens = tokenize(input, "segmenter");
            expect(tokens).toContain("プログラミング");
            expect(tokens).toContain("入門");
        });

        it("handles basic Japanese text with trigram", () => {
            const input = "プログラミング";
            const tokens = tokenize(input, "trigram");
            expect(tokens).toEqual([
                "プログ",
                "ログラ",
                "グラミ",
                "ラミン",
                "ミング",
            ]);
        });

        it("normalizes different character forms", () => {
            const inputs = [
                "ﾌﾟﾛｸﾞﾗﾐﾝｸﾞ", // 半角カタカナ
                "プログラミング", // 全角カタカナ
                "ぷろぐらみんぐ", // ひらがな
            ];
            const expected = ["プログラミング"];

            inputs.forEach((input) => {
                const tokens = tokenize(input, "segmenter");
                expect(tokens).toContain(expected[0]);
            });
        });

        it("handles mixed text with spaces and symbols", () => {
            const input = "プログラミング・入門 A";
            const tokens = tokenize(input, "segmenter");
            expect(tokens).toContain("プログラミング");
            expect(tokens).toContain("入門");
            expect(tokens).toContain("a");
        });

        it("removes unnecessary symbols", () => {
            const input = "プログラミング〜入門・基礎";
            const tokens = tokenize(input, "segmenter");
            expect(tokens.some((t) => t.includes("〜"))).toBeFalsy();
            expect(tokens.some((t) => t.includes("・"))).toBeFalsy();
        });
    });

    describe("encode", () => {
        it("normalizes text consistently", () => {
            const inputs = [
                "ﾌﾟﾛｸﾞﾗﾐﾝｸﾞ入門",
                "プログラミング入門",
                "ぷろぐらみんぐにゅうもん",
            ];

            inputs.forEach((input) => {
                const result = encode(input);
                expect(
                    result === "プログラミングニュウモン" ||
                        result === "プログラミング入門"
                ).toBeTruthy();
            });
        });

        it("handles mixed character types", () => {
            const input = "Python３・基礎";
            const expected = "python3基礎";
            expect(encode(input)).toBe(expected);
        });

        it("removes spaces and symbols", () => {
            const input = "プログラミング　・　入門 〜 基礎";
            expect(encode(input)).contain("プログラミング");
            expect(encode(input)).contain("入門");
            expect(encode(input)).contain("基礎");
        });

        it("converts all text to lowercase", () => {
            const input = "PYTHON プログラミング";
            expect(encode(input)).contain("python");
            expect(encode(input)).contain("プログラミング");
        });
    });
});
