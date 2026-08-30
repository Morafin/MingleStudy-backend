export type Todo = {
    id: number;
    text: string;
    completed: boolean;
    createdAt: string;
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
    return response.json() as Promise<T>;
}

export const getMyTodos = (initData: string) => request<Todo[]>("/api/todos/mine", initData);

export const createTodo = (initData: string, text: string) =>
    request<Todo>("/api/todos", initData, { method: "POST", body: JSON.stringify({ text }) });

export const toggleTodo = (initData: string, id: number) =>
    request<Todo>(`/api/todos/${id}/toggle`, initData, { method: "PATCH" });

export const deleteTodo = (initData: string, id: number) =>
    request<void>(`/api/todos/${id}`, initData, { method: "DELETE" });