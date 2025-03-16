// Common normalization functions
export const normalizeText = (text: string): string => {
    return text.replace(/[\s　]+/g, " ").trim();
};

export const extractTeachers = (teachersString: string): string[] => {
    return teachersString
        .split("、")
        .map((t) => t.trim())
        .filter(Boolean);
};

export function parseClassCode(id: string): string {
    if (id.length === 14) {
        return `${id.substring(4, 7)}`;
    }
    return id;
}
