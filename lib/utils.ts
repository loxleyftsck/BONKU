/**
 * Re-export so there is exactly one `cn` implementation.
 *
 * shadcn/ui generates components importing from "@/lib/utils", while the app
 * code imports from "@/lib/utils/cn". Both paths previously held their own
 * copy of the function. This keeps the generator's expected path working
 * without a second implementation drifting from the first.
 */
export { cn } from "./utils/cn";
