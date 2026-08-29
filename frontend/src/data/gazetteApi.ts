export type GazettePost = {
    id: number;
    category: string;
    title: string;
    teaser: string;
    sourceName: string;
    sourceUrl: string;
    imageUrl: string | null;
    publishedAt: string; // ISO timestamp
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const authHeaders = (initData: string) => ({
    "Content-Type": "application/json",
    "X-Telegram-Init-Data": initData,
});

async function request<T>(path: string, initData: string, options?: RequestInit): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${apiUrl}${path}`, { ...options, headers: { ...authHeaders(initData), ...options?.headers } });
    } catch (networkError) {
        throw new Error(`Network error calling ${apiUrl}${path}: ${(networkError as Error).message}`);
    }

    if (!response.ok) {
        let bodyText = "";
        try { bodyText = await response.text(); } catch { /* ignore */ }
        throw new Error(`${response.status} ${response.statusText} on ${path}${bodyText ? ` — ${bodyText}` : ""}`);
    }

    return response.json() as Promise<T>;
}

export const getGazettePosts = (initData: string, category?: string) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return request<GazettePost[]>(`/api/gazette${query}`, initData);
};

// Turns a category code like "STUDY_TIPS" into a display label like "Study Tips".
export function formatCategoryLabel(category: string): string {
    return category
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Turns a publishedAt ISO timestamp into a short relative label ("2h ago", "3d ago"),
// falling back to a short date for anything older than a week.
export function formatPublishedAt(publishedAt: string): string {
    const publishedMs = new Date(publishedAt).getTime();
    if (Number.isNaN(publishedMs)) return "";

    const diffMs = Date.now() - publishedMs;
    const diffMinutes = Math.floor(diffMs / 60_000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(publishedMs).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}