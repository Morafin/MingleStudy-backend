import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ProfileForm from "./components/ProfileForm";
import StudyCalendar from "./components/StudyCalendar";
import GroupsPage from "./components/GroupsPage";
import JournalPage from "./components/JournalPage";
import LibraryPage from "./components/LibraryPage";
import SettingsPage from "./components/SettingsPage";
import WeeklyTimetable from "./components/WeeklyTimetable";
import LiveClock from "./components/LiveClock";
import Toast from "./components/Toast";
import { getMyProfile, joinViaInvite, type StudentProfile } from "./data/profileApi";
import { haptics } from "./data/haptics";

import "./styles/global.css";
import "./styles/sidebar.css";
import "./styles/profile-form.css";
import "./styles/calendar.css";
import "./styles/groups.css";
import "./styles/timetable.css";
import "./styles/schedule-editor.css";
import "./styles/journal.css";
import "./styles/library.css";
import "./styles/settings.css";

interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    requestFullscreen?: () => void;
    initData: string;
    initDataUnsafe?: {
        user?: {
            id?: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
        };
        start_param?: string;
    };
    colorScheme?: "light" | "dark";
    themeParams?: Record<string, string | undefined>;
    onEvent?: (eventType: string, callback: () => void) => void;
    offEvent?: (eventType: string, callback: () => void) => void;
    HapticFeedback?: {
        impactOccurred: (style: string) => void;
        notificationOccurred: (type: string) => void;
        selectionChanged: () => void;
    };
}

declare global {
    interface Window { Telegram?: { WebApp?: TelegramWebApp } }
}

type View = "dashboard" | "groups" | "journal" | "library" | "settings";
type ThemePreference = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "minglestudy-theme-preference";
const INVITE_PARAM_PATTERN = /^uni_(\d+)$/;

function getStoredThemePreference(): ThemePreference {
    if (typeof window === "undefined") return "system";
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function DashboardSkeleton() {
    return (
        <>
            <div className="skeleton-card">
                <div className="skeleton skeleton-line short" />
                <div className="skeleton skeleton-block" />
            </div>
            <div className="skeleton-card">
                <div className="skeleton skeleton-line medium" />
                <div className="skeleton skeleton-line full" />
                <div className="skeleton skeleton-line full" />
            </div>
        </>
    );
}

function App() {
    const telegram = window.Telegram?.WebApp;
    const initData = telegram?.initData ?? "";
    const telegramUser = telegram?.initDataUnsafe?.user;
    const startParam = telegram?.initDataUnsafe?.start_param ?? "";
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(Boolean(initData));
    const [editingProfile, setEditingProfile] = useState(false);
    const [view, setView] = useState<View>("dashboard");
    const [themePreference, setThemePreferenceState] = useState<ThemePreference>(getStoredThemePreference);
    const [inviteToast, setInviteToast] = useState<string | null>(null);
    const [inviteHandled, setInviteHandled] = useState(false);
    const isTelegram = Boolean(initData);

    const setThemePreference = (preference: ThemePreference) => {
        setThemePreferenceState(preference);
        window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    };

    const browserProfile = useMemo<StudentProfile>(() => ({
        telegramId: 0,
        firstName: telegramUser?.first_name ?? "Student",
        lastName: telegramUser?.last_name ?? "",
        photoUrl: telegramUser?.photo_url ?? null,
        username: null,
        bio: null,
        university: null,
        onboardingComplete: true,
    }), [telegramUser?.first_name, telegramUser?.last_name, telegramUser?.photo_url]);

    useEffect(() => {
        telegram?.ready();
        telegram?.expand();
        if (!initData) return;
        getMyProfile(initData).then(setProfile).catch(() => setProfile(null)).finally(() => setLoading(false));
    }, [initData, telegram]);

    useEffect(() => {
        if (!initData || loading || inviteHandled) return;

        const match = INVITE_PARAM_PATTERN.exec(startParam);
        if (!match) { setInviteHandled(true); return; }

        const universityId = Number(match[1]);
        setInviteHandled(true);

        joinViaInvite(initData, universityId)
            .then((result) => {
                setProfile(result.profile);
                if (result.joined) {
                    haptics.success();
                    setInviteToast(`Joined ${result.profile.university?.name ?? "your classmate's university"}!`);
                    setView("groups");
                } else if (result.reason === "already_in_other_university") {
                    setInviteToast("You're already part of a different university group.");
                }
            })
            .catch(() => {
                haptics.error();
                setInviteToast("Couldn't process that invite link. Try again?");
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initData, loading, inviteHandled, startParam]);

    useEffect(() => {
        const applyTheme = () => {
            const effective = themePreference === "system" ? (telegram?.colorScheme ?? "light") : themePreference;
            document.documentElement.dataset.theme = effective;
        };

        applyTheme();

        if (themePreference === "system" && telegram) {
            telegram.onEvent?.("themeChanged", applyTheme);
            return () => telegram.offEvent?.("themeChanged", applyTheme);
        }
    }, [telegram, themePreference]);

    const activeProfile = profile ?? browserProfile;
    const showProfileForm = isTelegram && (!profile?.onboardingComplete || editingProfile);

    const goToDashboard = () => {
        setEditingProfile(false);
        setView("dashboard");
    };

    const goToGroups = () => {
        setEditingProfile(false);
        setView("groups");
    };

    const goToJournal = () => {
        setEditingProfile(false);
        setView("journal");
    };

    const goToLibrary = () => {
        setEditingProfile(false);
        setView("library");
    };

    const goToSettings = () => {
        setEditingProfile(false);
        setView("settings");
    };

    const sidebar = (
        <Sidebar
            firstName={activeProfile.firstName}
            photoUrl={activeProfile.photoUrl ?? undefined}
            bio={activeProfile.bio}
            onProfileClick={() => setEditingProfile(true)}
            onDashboardClick={goToDashboard}
            onGroupsClick={goToGroups}
            onJournalClick={goToJournal}
            onLibraryClick={goToLibrary}
            onSettingsClick={goToSettings}
        />
    );

    if (loading) {
        return (
            <div className="app-shell">
                {sidebar}
                <main className="app">
                    <DashboardSkeleton />
                </main>
            </div>
        );
    }

    if (showProfileForm) {
        return (
            <div className="app-shell">
                {sidebar}
                <main className="app">
                    <ProfileForm
                        initData={initData}
                        profile={activeProfile}
                        onSaved={(savedProfile) => { setProfile(savedProfile); setEditingProfile(false); }}
                        onCancel={profile?.onboardingComplete ? () => setEditingProfile(false) : undefined}
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="app-shell">
            {sidebar}
            <main className="app">
                {inviteToast && <Toast message={inviteToast} onDismiss={() => setInviteToast(null)} />}
                {!isTelegram && <p className="preview-banner">Preview mode — open MingleStudy in Telegram to create a real profile.</p>}
                <div key={view} className="view-transition">
                    {view === "dashboard" && (
                        <>
                            <LiveClock />
                            <div className="dashboard-grid">
                                <StudyCalendar />
                                <WeeklyTimetable initData={initData} universityName={activeProfile.university?.name} />
                            </div>
                        </>
                    )}
                    {view === "groups" && (
                        <GroupsPage initData={initData} onEditProfile={() => setEditingProfile(true)} />
                    )}
                    {view === "journal" && (
                        <JournalPage initData={initData} />
                    )}
                    {view === "library" && (
                        <LibraryPage initData={initData} />
                    )}
                    {view === "settings" && (
                        <SettingsPage
                            firstName={activeProfile.firstName}
                            photoUrl={activeProfile.photoUrl ?? undefined}
                            bio={activeProfile.bio}
                            onProfileClick={() => setEditingProfile(true)}
                            themePreference={themePreference}
                            onThemePreferenceChange={setThemePreference}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
