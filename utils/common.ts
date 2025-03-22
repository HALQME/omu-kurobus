import { nanoid } from "nanoid";

export function parseClassCode(code: string): string {
    // 数字+アルファベット+数字のパターンを抽出
    const match = code.match(/(\d*)([A-Za-z]+)(\d*)/);
    if (!match) return code;

    const [, prefix, department, suffix] = match;

    // 学部コードを3文字に正規化
    let normalizedDepartment = department;
    if (department.length > 4) {
        normalizedDepartment = department.slice(-3);
    }

    // プレフィックスがない場合は1を追加
    const normalizedPrefix = prefix || "1";

    // サフィックスは使用しない
    return `${normalizedPrefix}${normalizedDepartment}`;
}

export function extractTeachers(teachers: string): string[] {
    if (!teachers) return [];
    return teachers
        .split(/[,、]/)
        .map((t) => t.trim())
        .filter(Boolean);
}

export function normalizeText(text: string): string {
    return (
        text
            // 全角スペースを半角に変換
            .replace(/　/g, " ")
            // 連続するスペースを1つに
            .replace(/\s+/g, " ")
            // 前後のスペースを削除
            .trim()
    );
}
