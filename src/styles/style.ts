// 色の定義
const colors = {
    primary: {
        light: "bg-blue-50/90 text-blue-600 border-blue-100",
        default: "bg-blue-400 hover:bg-blue-500 text-white",
        dark: "bg-blue-500 hover:bg-blue-600 text-white",
        focus: "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
        focusDark: "dark:focus:ring-blue-300 dark:focus:ring-offset-gray-800",
        subtle: "text-blue-500 dark:text-blue-300",
    },
    gray: {
        lightest: "bg-slate-50/70 dark:bg-slate-800/20",
        light: "bg-slate-100/80 dark:bg-slate-700/70",
        default: "bg-slate-200 dark:bg-slate-600/80",
        border: "border-slate-200 dark:border-slate-700/70",
        text: "text-slate-600 dark:text-slate-300",
        label: "text-slate-700 dark:text-slate-300",
        heading: "text-slate-800 dark:text-slate-200",
    },
    red: {
        light: "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    },
    green: {
        light: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        default: "bg-emerald-500 hover:bg-emerald-600 text-white",
    },
    amber: {
        light: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        default: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    purple: {
        light: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
        default: "bg-violet-500 hover:bg-violet-600 text-white",
    },
};

// 共通のスタイル
const common = {
    focus: "focus:outline-none focus:ring-2 focus:ring-offset-1",
    transition: "transition-all duration-200",
    card: "bg-white/90 dark:bg-slate-800/80 border rounded-lg shadow-sm backdrop-blur-sm",
    container: "max-w-3xl mx-auto",
};

export const styles = {
    // 入力フィールド
    input: `w-full px-4 py-2.5 border ${colors.gray.border} rounded-md ${common.transition} bg-white/95 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:border-blue-300/70 dark:hover:border-blue-500/50 hover:shadow-sm`,

    // 入力フィールドのフォーカス状態
    inputFocus:
        "focus:ring-1 focus:ring-blue-300 focus:border-blue-300 focus:shadow-sm transition-shadow duration-200",

    // ボタンスタイル
    button: {
        primary: `w-full px-4 py-2 mb-2 ${colors.primary.default} font-medium rounded-md shadow-sm ${common.transition} hover:shadow hover:translate-y-[-1px] active:translate-y-[1px] ${common.focus}`,
        reset: `w-full px-4 py-2 mb-2 ${colors.gray.light} text-slate-700 dark:text-slate-200 font-medium rounded-md shadow-sm ${common.transition} hover:shadow hover:translate-y-[-1px] active:translate-y-[1px] ${common.focus} focus:ring-slate-400`,
    },

    // ページ背景
    pageBackground:
        "bg-slate-50/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200",

    // ヘッダースタイル
    header: {
        header: "sticky top-0 z-50 py-0 bg-gradient-to-r from-blue-200 to-purple-100 dark:from-gray-800 dark:to-gray-900 text-white py-4 shadow-lg transition-colors duration-300",
        container: "flex items-center justify-between h-16 px-4",
        title: "text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-700 dark:from-gray-100 dark:to-white",
    },

    // フォームラベル
    label: `block ${colors.gray.label} font-medium mb-1.5 text-base`,

    // 検索結果カード
    card: {
        container: `${common.card} p-4 ${colors.gray.border} hover:shadow hover:border-blue-100/70 dark:hover:border-blue-700/40 ${common.transition} cursor-pointer hover:translate-y-[-1px]`,
        title: `text-lg font-semibold ${colors.gray.heading} mb-2 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200`,
        label: "w-24 font-medium text-slate-500 dark:text-slate-400",
        value: "text-slate-800 dark:text-slate-200 flex-1",
        row: "flex items-center mb-1.5 last:mb-0",
        badge: "px-2 py-0.5 text-xs font-medium bg-slate-100/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200/80 dark:hover:bg-slate-600/60 transition-colors duration-200",
    },

    // サジェスト候補のドロップダウン
    suggestions:
        "absolute z-10 w-full mt-1 bg-white/95 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700/60 rounded-md max-h-60 overflow-y-auto backdrop-blur-sm transition-all duration-200",

    // バッジとタグ
    badge: `${colors.primary.light} px-2.5 py-1 text-sm rounded-md transition-all duration-200`,

    // セクション見出し
    sectionHeading: `text-xl font-bold mb-4 ${colors.gray.heading} flex items-center relative after:content-[''] after:absolute after:bottom-[-0.5rem] after:left-0 after:w-16 after:h-0.5 after:bg-blue-300/70 after:rounded-full after:opacity-75`,

    // エラー表示
    errorAlert: `p-4 ${colors.red.light} rounded-lg mb-6 border shadow-sm`,

    // 詳細パネル
    detailsPanel: `${colors.gray.lightest} rounded-lg p-3 mb-2 border border-slate-200/70 dark:border-slate-700/50 hover:border-blue-100/70 dark:hover:border-blue-700/40 ${common.transition} hover:shadow-sm`,
    detailsSummary: `font-medium cursor-pointer text-lg hover:text-blue-500 dark:hover:text-blue-300 ${common.transition} focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-md px-2 flex items-center gap-2 hover:translate-x-0.5`,

    // セクション関連のスタイル
    section: {
        container: "mb-10",
        headingWrapper: "flex items-center justify-center mb-6",
        headingLine: "w-16 h-px",
        headingLineLeft: "bg-gradient-to-r from-transparent to-blue-400",
        headingLineRight: "bg-gradient-to-l from-transparent to-blue-400",
        title: "px-4 text-2xl font-bold text-gray-800 dark:text-gray-200",
        content:
            "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700",
    },

    // フォーム要素のスタイル
    form: {
        label: "block text-sm font-medium text-gray-700 dark:text-gray-300",
        input: "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-gray-300",
        textarea:
            "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-gray-300",
    },
};
