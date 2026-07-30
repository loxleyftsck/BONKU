import { redirect } from "next/navigation";

// The dashboard lives at /dashboard; "/" is only an entry point.
export default function RootPage() {
    redirect("/dashboard");
}
