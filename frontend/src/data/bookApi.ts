export type Book = {
    id: number;
    title: string;
    author: string;
    coverUrl: string | null;
    fileUrl: string | null;
    description: string | null;
    category: string | null;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080"\;

async function request<T>(path: string, initData: string, options?: RequestInit): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${apiUrl}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "X-Telegram-Init-Data": initData,
                ...options?.headers,
            },
        });
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

export const getBooks = (initData: string) => request<Book[]>("/api/books", initData);
