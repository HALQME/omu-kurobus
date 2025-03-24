import { nanoid } from "nanoid";

export const parseClassCode = (classCode: string): string => {
    if (classCode.length < 3) {
        return classCode.padStart(3, "1");
    } else if (classCode.length === 3 || classCode.length === 4) {
        return classCode;
    } else if (classCode.length < 7) {
        return classCode.substring(0, 3);
    } else {
        return classCode.substring(4, 7);
    }
};

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
