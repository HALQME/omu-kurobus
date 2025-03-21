import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";

let turso;

if (process.env.NODE_ENV === "development") {
    turso = createClient({
        url: "file:local.db",
    });
} else {
    turso = createClient({
        url: import.meta.env.TURSO_DATABASE_URL,
        authToken: import.meta.env.TURSO_AUTH_TOKEN,
    });
}

export const db = drizzle(turso);
