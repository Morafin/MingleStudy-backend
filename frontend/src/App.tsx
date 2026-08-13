import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import ProfileForm from "./components/ProfileForm";
import StudyHero from "./components/StudyHero";
import StudyGroups from "./components/StudyGroups";
import PeopleStudying from "./components/PeopleStudying";
import { getMyProfile, type StudentProfile } from "./data/profileApi";
import "./styles/dashboard.css";

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
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

  if (loading) return <main className="app"><p className="status-message">Loading your MingleStudy profile…</p></main>;

  if (showProfileForm) {
    return (
      <main className="app">
        <ProfileForm
          initData={initData}
          profile={activeProfile}
          onSaved={(savedProfile) => { setProfile(savedProfile); setEditingProfile(false); }}
          onCancel={profile?.onboardingComplete ? () => setEditingProfile(false) : undefined}
        />
      </main>
    );
  }

  return (
    <main className="app">
      {!isTelegram && <p className="preview-banner">Preview mode — open MingleStudy in Telegram to create a real profile.</p>}
      <Header firstName={activeProfile.firstName} photoUrl={activeProfile.photoUrl ?? undefined} onProfileClick={() => setEditingProfile(true)} />
      <StudyHero />
      <StudyGroups />
      <PeopleStudying />
    </main>
  );
}

export default App;
