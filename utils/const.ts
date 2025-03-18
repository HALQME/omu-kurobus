export const CLASS_IDs = [
    {
        group: "基幹教育科目",
        items: [
            { id: "1GA", name: "総合教養科目（般教）" },
            { id: "1GB", name: "初年次教育科目（初ゼミ）" },
            { id: "1GC", name: "情報リテラシー科目" },
            { id: "1GF", name: "健康・スポ=ツ科学科目" },
            { id: "1GG", name: "基礎教育科目" },
        ],
    },
    {
        group: "外国語科目",
        items: [
            { id: "1GDA", name: "英語" },
            { id: "1GDB", name: "ドイツ語" },
            { id: "1GDC", name: "フランス語" },
            { id: "1GDD", name: "中国語" },
            { id: "1GDE", name: "ロシア語" },
            { id: "1GDF", name: "韓国語" },
        ],
    },
    {
        group: "専門科目",
        items: [
            { id: "1AA", name: "現代システム科学域" },
            { id: "1AB", name: "文学部" },
            { id: "1AC", name: "法学部" },
            { id: "1AD", name: "経済学部" },
            { id: "1AE", name: "商学部" },
            { id: "1AF", name: "理学部" },
            { id: "1AG", name: "工学部" },
            { id: "1AK", name: "農学部" },
            { id: "1AL", name: "獣医学部" },
            { id: "1AM", name: "医学部" },
            { id: "1AP", name: "看護学部" },
            { id: "1AQ", name: "生活科学部" },
        ],
    },
];

export const PATH_PAIRS = () => {
    const submits = SUBMIT_PAIRS();
    const searches = SEARCH_PAIRS();
    const negatives = NEGATIVE_PAIRS();

    const paris = [...submits, ...searches];
    return paris.filter(
        (pair) =>
            negatives.some(
                (negative) =>
                    negative.year === pair.path.year &&
                    negative.semester === pair.path.semester
            ) === false
    );
};

const SUBMIT_PAIRS = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const month = now.getMonth();

    const academicYear = month <= 2 ? currentYear - 1 : currentYear;

    let pairs: {
        type: "submit" | "search";
        path: { year: string; semester: string };
    }[] = [];

    switch (month) {
        case 1: // 2月
        case 2: // 3月
            pairs = [
                {
                    type: "submit",
                    path: {
                        year: academicYear.toString(),
                        semester: "1",
                    },
                },
            ];
            break;
        case 6: // 7月
        case 7: // 8月
            pairs = [
                {
                    type: "submit",
                    path: { year: academicYear.toString(), semester: "0" },
                },
            ];
            break;
        default:
            break;
    }
    return pairs;
};

const data = await fetch(
    "https://raw.githubusercontent.com/HALQME/omu-course-library/refs/heads/main/index.json"
).then((res) => res.json());

const SEARCH_PAIRS = () => {
    const availablePairs = SUBMIT_PAIRS();

    const archivedPairs: {
        type: "submit" | "search";
        path: { year: string; semester: string };
    }[] = [];

    for (const yearData of data) {
        for (const semester of yearData.semester) {
            archivedPairs.push({
                type: "search",
                path: {
                    year: yearData.year.toString(),
                    semester: semester,
                },
            });
        }
    }

    return archivedPairs.filter(
        (pair) =>
            !availablePairs.some(
                (availablePair) =>
                    availablePair.path.year === pair.path.year &&
                    availablePair.path.semester === pair.path.semester
            )
    );
};

const NEGATIVE_PAIRS = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const month = now.getMonth();

    const academicYear = month <= 2 ? currentYear - 1 : currentYear;

    let pairs: {
        year: string;
        semester: string;
    }[] = [];

    if (month <= 2) {
        pairs = [
            {
                year: (academicYear + 1).toString(),
                semester: "1",
            },
            {
                year: (academicYear + 1).toString(),
                semester: "0",
            },
        ];
    } else if (month <= 6) {
        pairs = [
            {
                year: academicYear.toString(),
                semester: "1",
            },
        ];
    }

    return pairs;
};

export const CAMPUS_NAME = (campus: string | undefined): string | undefined => {
    const campusMap: { [key: string]: string } = {
        "0": "中百舌鳥",
        "1": "杉本",
        "2": "遠隔用",
        "3": "その他",
    };
    if (campus === undefined) return undefined;
    return campusMap[campus] || campus;
};

