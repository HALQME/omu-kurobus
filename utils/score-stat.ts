import type { CourseScore } from "@/types/schema";

function calculateAverage(
    scores: CourseScore[],
    key: keyof CourseScore
): number {
    const validScores = scores
        .map((s) => s[key])
        .filter((s) => typeof s === "number") as number[];
    if (validScores.length === 0) return 0;
    return (
        validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    );
}

function calculateMedian(
    scores: CourseScore[],
    key: keyof CourseScore
): number {
    const validScores = scores
        .map((s) => s[key])
        .filter((s) => typeof s === "number") as number[];
    if (validScores.length === 0) return 0;
    const sortedScores = [...validScores].sort((a, b) => a - b);
    const middleIndex = Math.floor(sortedScores.length / 2);
    if (sortedScores.length % 2 === 0) {
        return (sortedScores[middleIndex - 1] + sortedScores[middleIndex]) / 2;
    } else {
        return sortedScores[middleIndex];
    }
}

export async function scoreStat(scores: CourseScore[]): Promise<CourseScore> {
    if (scores.length === 0) {
        throw new Error("Scores array cannot be empty");
    }

    const avgClassDifficulty = calculateAverage(scores, "classDifficulty");
    const avgTestDifficulty = calculateAverage(scores, "testDifficulty");
    const avgTestAmount = calculateAverage(scores, "testAmount");
    const avgGradingCriteria = calculateAverage(scores, "gradingCriteria");
    const avgTotalScore = calculateAverage(scores, "totalScore");

    const medianClassDifficulty = calculateMedian(scores, "classDifficulty");
    const medianTestDifficulty = calculateMedian(scores, "testDifficulty");
    const medianTestAmount = calculateMedian(scores, "testAmount");
    const medianGradingCriteria = calculateMedian(scores, "gradingCriteria");
    const medianTotalScore = calculateMedian(scores, "totalScore");

    return {
        student_department: "STAT", // TODO: 平均値・中央値の算出方法を検討
        courseType: [], // TODO: 平均値・中央値の算出方法を検討
        courseTypeOtherText: null,
        evalCriteria: [], // TODO: 平均値・中央値の算出方法を検討
        evalCriteriaOtherText: null,
        testType: null, // TODO: 最頻値などを検討
        testTypeOtherText: null,
        testItems: null, // TODO: 最頻値などを検討
        testItemsOtherText: null,
        id: scores[0].course_id,
        createdAt: new Date(),
        user_id: "統計", // TODO: 適切なユーザーIDを検討
        course_id: scores[0].course_id, // TODO: 適切な course_id を検討
        classDifficulty: avgClassDifficulty,
        testDifficulty: avgTestDifficulty,
        testAmount: avgTestAmount,
        gradingCriteria: avgGradingCriteria,
        totalScore: avgTotalScore,
        // Median values stored as string metadata since they're not in the type
        metadata: JSON.stringify({
            medianClassDifficulty,
            medianTestDifficulty,
            medianTestAmount,
            medianGradingCriteria,
            medianTotalScore,
        }),
    } as CourseScore;
}
