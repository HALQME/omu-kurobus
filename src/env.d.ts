interface ImportMetaEnv {
    readonly TURSO_DATABASE_URL: string;
    readonly TURSO_AUTH_TOKEN: string;
    readonly KV_REST_API_URL: string;
    readonly KV_REST_API_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

/// <reference path="../.astro/types.d.ts" />

declare namespace App {
    // Note: 'import {} from ""' syntax does not work in .d.ts files.
    interface Locals {
        user: import("better-auth").User | null;
        session: import("better-auth").Session | null;
    }
}