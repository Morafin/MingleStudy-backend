export type Weekday = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export type ScheduleEntry = {
    id: number;
    day: Weekday;
    startTime: string; // "HH:MM"
    endTime: string;   // "HH:MM"
    subject: string;
    type: string;
    teacher: string | null;
    room: string | null;
};

export type ScheduleEntryInput = {
    day: Weekday;
    startTime: string;
    endTime: string;
    subject: string;
    type: string;
    teacher?: string;
    room?: string;
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

    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
}

export const getMySchedule = (initData: string) =>
    request<ScheduleEntry[]>("/api/schedule/mine", initData);

export const createScheduleEntry = (initData: string, entry: ScheduleEntryInput) =>
    request<ScheduleEntry>("/api/schedule", initData, { method: "POST", body: JSON.stringify(entry) });

export const createScheduleEntriesBulk = (initData: string, entries: ScheduleEntryInput[]) =>
    request<ScheduleEntry[]>("/api/schedule/bulk", initData, { method: "POST", body: JSON.stringify({ entries }) });

export const updateScheduleEntry = (initData: string, id: number, entry: ScheduleEntryInput) =>
    request<ScheduleEntry>(`/api/schedule/${id}`, initData, { method: "PUT", body: JSON.stringify(entry) });

export const deleteScheduleEntry = (initData: string, id: number) =>
    request<void>(`/api/schedule/${id}`, initData, { method: "DELETE" });