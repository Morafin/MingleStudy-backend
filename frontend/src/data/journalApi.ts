const API_BASE = "https://minglestudy-backend-production.up.railway.app";

export type JournalEntry = {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
};

async function request<T>(path: string, initData: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData,
            ...(options.headers ?? {}),
        },
    });

    if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        throw new Error(bodyText || `Request failed with status ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export function getMyJournalEntries(initData: string): Promise<JournalEntry[]> {
    return request<JournalEntry[]>("/api/journal/mine", initData);
}

export function createJournalEntry(initData: string, content: string = ""): Promise<JournalEntry> {
    return request<JournalEntry>("/api/journal", initData, {
        method: "POST",
        body: JSON.stringify({ content }),
    });
}

export function updateJournalEntry(initData: string, id: number, content: string): Promise<JournalEntry> {
    return request<JournalEntry>(`/api/journal/${id}`, initData, {
        method: "PUT",
        body: JSON.stringify({ content }),
    });
}

export async function deleteJournalEntry(initData: string, id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/journal/${id}`, {
        method: "DELETE",
        headers: { "X-Telegram-Init-Data": initData },
    });
    if (res.status === 404) return; // already gone — treat as success, not an error
    if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        throw new Error(bodyText || `Request failed with status ${res.status}`);
    }
}