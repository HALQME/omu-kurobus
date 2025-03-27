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

    // 新しい重み付けでtotalScoreを計算: totalScoreが60%、他の項目がそれぞれ10%
    const weightedTotalScore =
        avgTotalScore * 0.6 +
        avgClassDifficulty * 0.1 +
        avgTestDifficulty * 0.1 +
        avgTestAmount * 0.1 +
        avgGradingCriteria * 0.1;

    const medianClassDifficulty = calculateMedian(scores, "classDifficulty");
    const medianTestDifficulty = calculateMedian(scores, "testDifficulty");
    const medianTestAmount = calculateMedian(scores, "testAmount");
    const medianGradingCriteria = calculateMedian(scores, "gradingCriteria");
    const medianTotalScore = calculateMedian(scores, "totalScore");

    // 中央値でも同様に重み付けを適用
    const weightedMedianTotalScore =
        medianTotalScore * 0.6 +
        medianClassDifficulty * 0.1 +
        medianTestDifficulty * 0.1 +
        medianTestAmount * 0.1 +
        medianGradingCriteria * 0.1;

    return {
        id: scores[0].course_id,
        createdAt: new Date(),
        user_id: "統計", // TODO: 適切なユーザーIDを検討
        course_id: scores[0].course_id, // TODO: 適切な course_id を検討
        classDifficulty: avgClassDifficulty,
        testDifficulty: avgTestDifficulty,
        testAmount: avgTestAmount,
        gradingCriteria: avgGradingCriteria,
        totalScore: weightedTotalScore, // 重み付けされた総合スコアを使用
        // Median values stored as string metadata since they're not in the type
        metadata: JSON.stringify({
            medianClassDifficulty,
            medianTestDifficulty,
            medianTestAmount,
            medianGradingCriteria,
            medianTotalScore,
            weightedMedianTotalScore, // 重み付けされた中央値の総合スコアも追加
        }),
    } as CourseScore;
}
