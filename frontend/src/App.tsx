import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ProfileForm from "./components/ProfileForm";
import StudyHero from "./components/StudyHero";
import StudyGroups from "./components/StudyGroups";
import PeopleStudying from "./components/PeopleStudying";
import StudyCalendar from "./components/StudyCalendar"; // <--- Added
import { getMyProfile, type StudentProfile } from "./data/profileApi";

// Modular CSS imports replacing dashboard.css
import "./styles/global.css";
import "./styles/sidebar.css";
import "./styles/hero.css";
import "./styles/study-groups.css";
import "./styles/profile-form.css";
import "./styles/calendar.css"; // <--- Added

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  requestFullscreen?: () => void;
  initData: string;
  initDataUnsafe?: { user?: { first_name?: string; last_name?: string; photo_url?: string } };
}

declare global {
  interface Window { Telegram?: { WebApp?: TelegramWebApp } }
}

function App() {
  const telegram = window.Telegram?.WebApp;
  const initData = telegram?.initData ?? "";
  const telegramUser = telegram?.initDataUnsafe?.user;
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(initData));
  const [editingProfile, setEditingProfile] = useState(false);
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

  const sidebar = (
      <Sidebar
          firstName={activeProfile.firstName}
          photoUrl={activeProfile.photoUrl ?? undefined}
          onProfileClick={() => setEditingProfile(true)}
          onDashboardClick={() => setEditingProfile(false)}
      />
  );

  if (loading) {
    return (
        <div className="app-shell">
          {sidebar}
          <main className="app"><p className="status-message">Loading your MingleStudy profile…</p></main>
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
          <StudyHero />
          <StudyGroups />
          <PeopleStudying />
          <StudyCalendar />
        </main>
      </div>
  );
}

export default App;