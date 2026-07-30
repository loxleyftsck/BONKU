import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// With `globals: false`, Testing Library cannot auto-register its cleanup, so
// renders would leak between tests and duplicate every query.
afterEach(() => {
    cleanup();
});

// Route handlers construct a Supabase client at call time. The client is
// mocked per-suite, but the module still reads these at import time in some
// paths, so give it something syntactically valid.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key";
