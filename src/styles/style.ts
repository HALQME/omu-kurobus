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
    focus: "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400/70 dark:focus:ring-blue-500/70",
    transition: "transition-all duration-300 ease-out",
    card: "bg-white/95 dark:bg-slate-800/90 border rounded-lg shadow-sm backdrop-blur-sm",
    container: "max-w-3xl mx-auto",
};

export const styles = {
    // 入力フィールド
    input: `w-full px-3.5 sm:px-4 py-2.5 border ${colors.gray.border} rounded-md ${common.transition} bg-white/95 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:border-blue-300/70 dark:hover:border-blue-500/50 hover:shadow-sm ease-in-out`,

    // 入力フィールドのフォーカス状態
    inputFocus:
        "focus:ring-2 focus:ring-blue-300/50 dark:focus:ring-blue-500/50 focus:border-blue-400 dark:focus:border-blue-500 focus:shadow-sm transition-all duration-200 ease-in-out",

    // ボタンスタイル
    button: {
        primary: `w-full px-4 py-2.5 sm:py-2 mb-2 ${colors.primary.default} font-medium rounded-md shadow-sm ${common.transition} hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] ${common.focus} ease-in-out`,
        reset: `w-full px-4 py-2.5 sm:py-2 mb-2 ${colors.gray.light} text-slate-700 dark:text-slate-100 font-medium rounded-md shadow-sm ${common.transition} hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] ${common.focus} focus:ring-slate-400 hover:bg-slate-200/90 dark:hover:bg-slate-600/90 ease-in-out`,
    },

    // ページ背景
    pageBackground:
        "bg-slate-50/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200",

    // ヘッダースタイル
    header: {
        header: "sticky top-0 z-50 bg-gradient-to-br from-blue-100/95 via-blue-50/90 to-purple-50/95 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 py-4 shadow-md backdrop-blur-sm transition-all duration-300",
        container:
            "flex items-center justify-between h-16 px-4 md:px-6 max-w-4xl mx-auto",
        title: "text-xl sm:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 hover:scale-[1.02] transition-transform duration-300",
    },

    footer: {
        container:
            "bg-gray-100 dark:bg-gray-800 py-3 flex flex-col md:flex-row sticky bottom-0",
        content:
            "max-w-4xl mx-auto px-4 py-1 sm:py-6 flex justify-between items-center",
    },

    index: {
        feature: `bg-white/95 dark:bg-slate-800/90 border rounded-lg shadow-sm backdrop-blur-sm p-4 sm:p-6 hover:shadow-md hover:border-blue-600/70 dark:hover:border-blue-200/40 hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 dark:hover:from-slate-800/95 dark:hover:to-blue-900/20 transition-all duration-300 ease-in-out hover:translate-y-[-2px]`,
        link: `px-4 py-2 bg-white/95 dark:bg-slate-800/90 border rounded-lg shadow-sm text-center hover:shadow-md hover:border-blue-600/70 dark:hover:border-blue-200/40 hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 dark:hover:from-slate-800/95 dark:hover:to-blue-900/20 transition-all duration-300 ease-in-out hover:translate-y-[-2px]`,
    },

    // フォームラベル
    label: `block ${colors.gray.label} font-medium mb-1.5 text-base`,

    // 検索結果カード
    card: {
        container: `${common.card} mb-4 p-3 sm:p-4 ${colors.gray.border} hover:shadow-md hover:border-blue-200/70 dark:hover:border-blue-600/40 ${common.transition} cursor-pointer hover:translate-y-[-2px] hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 dark:hover:from-slate-800/95 dark:hover:to-blue-900/20 ease-in-out`,
        title: `text-lg font-semibold ${colors.gray.heading} mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 ease-in-out group-hover:translate-x-0.5`,
        label: "w-20 sm:w-24 font-medium text-slate-500/90 dark:text-slate-400/90",
        value: "text-slate-800 dark:text-slate-200 flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 ease-in-out pl-2",
        row: "flex items-start sm:items-center mb-2 last:mb-0 group",
        badge: "px-2 py-0.5 text-xs font-medium bg-slate-100/90 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 rounded-md hover:bg-blue-100/80 dark:hover:bg-blue-800/40 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 ease-in-out",
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
        container: "mb-8 sm:mb-12",
        headingWrapper: "flex items-center justify-center mb-8",
        headingLine: "w-20 h-[2px]",
        headingLineLeft:
            "bg-gradient-to-r from-transparent via-blue-300 to-blue-400 dark:via-blue-500 dark:to-blue-400",
        headingLineRight:
            "bg-gradient-to-l from-transparent via-blue-300 to-blue-400 dark:via-blue-500 dark:to-blue-400",
        title: "px-6 text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight",
        content:
            "bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg p-5 sm:p-7 border border-slate-200/70 dark:border-slate-700/50 hover:border-blue-200/50 dark:hover:border-blue-700/30 transition-all duration-300",
    },

    // チェックボックスグループ
    checkboxGroup: {
        container: "space-y-2",
        item: "flex items-center min-h-[2rem] gap-2",
        input: "w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400/30 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-500",
        label: "text-sm font-medium text-gray-700 dark:text-gray-300",
        other: "flex flex-wrap sm:flex-nowrap items-center min-h-[2rem] gap-2",
        otherInput:
            "w-[calc(100%-2.5rem)] sm:w-auto sm:flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-400/30 dark:bg-gray-700 dark:text-gray-300",
    },

    // フォーム要素のスタイル
    form: {
        label: "block text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors duration-200",
        input: "mt-1 block w-full px-3.5 sm:px-4 py-2.5 sm:py-2 text-base sm:text-sm border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 dark:focus:border-blue-500 dark:bg-slate-800/90 dark:text-slate-200 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500/70",
        textarea:
            "mt-1 block w-full px-3.5 sm:px-4 py-2.5 sm:py-2 text-base sm:text-sm min-h-[100px] border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 dark:focus:border-blue-500 dark:bg-slate-800/90 dark:text-slate-200 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500/70",
        slider: {
            container: "flex flex-col space-y-2.5",
            wrapper: "relative flex items-center",
            input: "w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform",
            value: "absolute -top-7 left-1/2 transform -translate-x-1/2 px-2.5 py-1 bg-blue-500 text-white text-sm rounded-md shadow-md transition-all duration-200",
            labels: "flex justify-between text-sm text-slate-600 dark:text-slate-400 mt-1.5",
        },
    },
};
