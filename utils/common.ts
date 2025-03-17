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

export const parseClassCode = (classCode: string): string => {
    if (classCode.length <= 3) {
        return classCode.padStart(3, "1");
    } else if (4 <= classCode.length && classCode.length < 7) {
        return classCode.substring(4, 6).padStart(3, "1");
    } else {
        return classCode.substring(4, 7);
    }
};