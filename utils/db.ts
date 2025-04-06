import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";

import * as schema from "db/schema.ts";

let turso;

if (import.meta.env.DEV) {
    turso = createClient({
        url: "http://127.0.0.1:8080",
    });
} else {
    turso = createClient({
        url: import.meta.env.TURSO_DATABASE_URL,
        authToken: import.meta.env.TURSO_AUTH_TOKEN,
    });
}

export const db = drizzle(turso, { schema });
