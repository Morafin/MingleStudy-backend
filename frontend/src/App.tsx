import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ProfileForm from "./components/ProfileForm";
import StudyCalendar from "./components/StudyCalendar";
import GroupsPage from "./components/GroupsPage";
import JournalPage from "./components/JournalPage";
import WeeklyTimetable from "./components/WeeklyTimetable";
import LiveClock from "./components/LiveClock";
import { getMyProfile, type StudentProfile } from "./data/profileApi";

// Modular CSS imports replacing dashboard.css
import "./styles/global.css";
import "./styles/sidebar.css";
import "./styles/profile-form.css";
import "./styles/calendar.css";
import "./styles/groups.css";
import "./styles/timetable.css";
import "./styles/schedule-editor.css";
import "./styles/journal.css";

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
    };
}

declare global {
    interface Window { Telegram?: { WebApp?: TelegramWebApp } }
}

type View = "dashboard" | "groups" | "journal";

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
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(Boolean(initData));
    const [editingProfile, setEditingProfile] = useState(false);
    const [view, setView] = useState<View>("dashboard");
    const isTelegram = Boolean(initData);

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

    const sidebar = (
        <Sidebar
            firstName={activeProfile.firstName}
            photoUrl={activeProfile.photoUrl ?? undefined}
            bio={activeProfile.bio}
            onProfileClick={() => setEditingProfile(true)}
            onDashboardClick={goToDashboard}
            onGroupsClick={goToGroups}
            onJournalClick={goToJournal}
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
                </div>
            </main>
        </div>
    );
}

export default App;