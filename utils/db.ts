import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";

let turso;

if (process.env.NODE_ENV === "development") {
    turso = createClient({
        url: "http://127.0.0.1:8080",
    });
} else {
    turso = createClient({
        url: import.meta.env.TURSO_DATABASE_URL,
        authToken: import.meta.env.TURSO_AUTH_TOKEN,
    });
}

export const db = drizzle(turso);
