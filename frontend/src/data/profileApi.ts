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

export type GroupMember = {
  telegramId: number;
  firstName: string;
  lastName: string;
  username: string | null;
  photoUrl: string | null;
  bio: string | null;
  lastSeenAt: string | null;
};

export type MyGroup = {
  hasUniversity: boolean;
  university: University | null;
  memberCount: number;
  members: GroupMember[];
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
export const searchUniversities = (initData: string, query: string) =>
    request<University[]>(`/api/universities?query=${encodeURIComponent(query)}`, initData);
export const addUniversity = (initData: string, name: string) =>
    request<University>("/api/universities", initData, { method: "POST", body: JSON.stringify({ name }) });
export const saveProfile = (initData: string, values: { firstName: string; lastName: string; bio: string; universityId: number }) =>
    request<StudentProfile>("/api/me", initData, { method: "PUT", body: JSON.stringify(values) });
export const getMyGroup = (initData: string) => request<MyGroup>("/api/groups/mine", initData);

// Turns a lastSeenAt ISO timestamp into a short human-readable activity label.
// Returns null if there's nothing meaningful to show (no timestamp, or too long ago).
export function getActivityStatus(lastSeenAt: string | null): { label: string; isRecent: boolean } | null {
  if (!lastSeenAt) return null;

  const lastSeenMs = new Date(lastSeenAt).getTime();
  if (Number.isNaN(lastSeenMs)) return null;

  const diffMs = Date.now() - lastSeenMs;
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 2) return { label: "Active now", isRecent: true };
  if (diffMinutes < 60) return { label: `Active ${diffMinutes}m ago`, isRecent: true };

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return { label: `Active ${diffHours}h ago`, isRecent: false };

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return { label: `Active ${diffDays}d ago`, isRecent: false };

  return null; // more than a week ago — not worth showing
}