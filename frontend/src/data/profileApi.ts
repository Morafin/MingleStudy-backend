export type University = { id: number; name: string; country: string; studentCount: number };
export type StudentProfile = {
  telegramId: number;
  firstName: string;
  lastName: string;
  bio: string | null;
  username: string | null;
  photoUrl: string | null;
  university: University | null;
  onboardingComplete: boolean;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const authHeaders = (initData: string) => ({ "Content-Type": "application/json", "X-Telegram-Init-Data": initData });

async function request<T>(path: string, initData: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, { ...options, headers: { ...authHeaders(initData), ...options?.headers } });
  } catch (networkError) {
    // fetch() itself threw — backend unreachable, wrong URL, CORS preflight blocked, no HTTPS, etc.
    throw new Error(`Network error calling ${apiUrl}${path}: ${(networkError as Error).message}`);
  }

  if (!response.ok) {
    let bodyText = "";
    try { bodyText = await response.text(); } catch { /* ignore */ }
    throw new Error(`${response.status} ${response.statusText} on ${path}${bodyText ? ` — ${bodyText}` : ""}`);
  }

  return response.json() as Promise<T>;
}

export const getMyProfile = (initData: string) => request<StudentProfile>("/api/me", initData);
export const searchUniversities = (initData: string, query: string) => request<University[]>(`/api/universities?query=${encodeURIComponent(query)}`, initData);
export const addUniversity = (initData: string, name: string) => request<University>("/api/universities", initData, { method: "POST", body: JSON.stringify({ name }) });
export const saveProfile = (initData: string, values: { firstName: string; lastName: string; bio: string; universityId: number }) =>
    request<StudentProfile>("/api/me", initData, { method: "PUT", body: JSON.stringify(values) });