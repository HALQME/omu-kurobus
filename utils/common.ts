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