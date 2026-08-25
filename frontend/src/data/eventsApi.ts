export type StudyEvent = {
    id: number;
    title: string;
    startTime: string; // ISO instant, UTC
    notified: boolean;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, initData: string, options: RequestInit = {}): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${apiUrl}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "X-Telegram-Init-Data": initData,
                ...options.headers,
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

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}

export const getMyEvents = (initData: string) => request<StudyEvent[]>("/api/events/mine", initData);

export const createEvent = (initData: string, title: string, startTime: string) =>
    request<StudyEvent>("/api/events", initData, {
        method: "POST",
        body: JSON.stringify({ title, startTime }),
    });

export const deleteEvent = (initData: string, id: number) =>
    request<void>(`/api/events/${id}`, initData, { method: "DELETE" });
