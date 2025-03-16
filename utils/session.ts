import { type StorageHistory } from "@/types/schema";

export class sessionStorageManager {
    static clear() {
        sessionStorage.clear();
    }

    // initialize store
    static init() {
        this.clear();
        sessionStorage.setItem("kurobusHistoryCount_search", "0");
        sessionStorage.setItem("kurobusHistoryCount_submit", "0");
    }

    // get latest value
    static latest(key: "search" | "submit") {
        const length = sessionStorage.getItem(`kurobusHistoryCount_${key}`);
        if (length == "0" || length == null) {
            return null;
        } else {
            return sessionStorage.getItem(
                `kurobusHisotryValue_${key}_${length}`
            );
        }
    }

    // get all value
    static list(key: "search" | "submit") {
        const length = parseInt(
            sessionStorage.getItem(`kurobusHistoryCount_${key}`) || "0"
        );
        if (length == 0 || length == null) {
            return null;
        }
        let values: StorageHistory[] = [];
        for (let i = 0; i < length; i += 1) {
            const value = sessionStorage.getItem(
                `kurobusHistoryValue_${key}_${i}`
            );
            if (value == null) {
                continue;
            }
            values.push({ key: `${i}`, value: value });
        }
        return values;
    }

    static add(key: "search" | "submit", value: string) {
        const latest = parseInt(this.latest(key) || "0");
        const next = (latest + 1).toString();
        sessionStorage.setItem(`kurobusHistoryCount_${key}`, next);
        sessionStorage.setItem(`kurobusHistoryValue_${key}_${next}`, value);
    }
}
