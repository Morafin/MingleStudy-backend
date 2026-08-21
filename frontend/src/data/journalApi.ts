const API_BASE = "https://minglestudy-backend-production.up.railway.app";

export type JournalEntry = {
    id: number;
    date: string; // YYYY-MM-DD
    content: string;
    updatedAt: string;
};

type JournalEntryInput = {
    date: string;
    content: string;
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

export function saveJournalEntry(initData: string, input: JournalEntryInput): Promise<JournalEntry> {
    return request<JournalEntry>("/api/journal", initData, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function deleteJournalEntry(initData: string, id: number): Promise<void> {
    return request<void>(`/api/journal/${id}`, initData, { method: "DELETE" });
}