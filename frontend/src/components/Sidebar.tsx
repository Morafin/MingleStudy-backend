import { useRef, useState } from "react";

type SidebarProps = {
    firstName: string;
    photoUrl?: string;
    bio?: string | null;
    onProfileClick: () => void;
    onDashboardClick: () => void;
    onGroupsClick: () => void;
    onJournalClick: () => void;
    onLibraryClick: () => void;
    onGazetteClick: () => void;
    onSettingsClick: () => void;
};

type NavKey = "dashboard" | "calendar" | "journal" | "groups" | "library" | "gazette" | "settings";

export default function Sidebar({
                                    firstName,
                                    photoUrl,
                                    bio,
                                    onProfileClick,
                                    onDashboardClick,
                                    onGroupsClick,
                                    onJournalClick,
                                    onLibraryClick,
                                    onGazetteClick,
                                    onSettingsClick,
                                }: SidebarProps) {
    const [active, setActive] = useState<NavKey>("dashboard");
    const sidebarRef = useRef<HTMLElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const el = sidebarRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width) * 100;
        const my = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--mx", `${mx}%`);
        el.style.setProperty("--my", `${my}%`);
    };

    const handleDashboardClick = () => {
        setActive("dashboard");
        onDashboardClick();
    };

    const handleCalendarClick = () => {
        setActive("calendar");
        onDashboardClick();
        setTimeout(() => {
            document.querySelector(".calendar-section")?.scrollIntoView({ behavior: "smooth" });
        }, 50);
    };

    const handleJournalClick = () => {
        setActive("journal");
        onJournalClick();
    };

    const handleGroupsClick = () => {
        setActive("groups");
        onGroupsClick();
    };

    const handleLibraryClick = () => {
        setActive("library");
        onLibraryClick();
    };

    const handleGazetteClick = () => {
        setActive("gazette");
        onGazetteClick();
    };

    const handleSettingsClick = () => {
        setActive("settings");
        onSettingsClick();
    };

    const handleAccountClick = () => {
        setActive("settings");
        onProfileClick();
    };

    return (
        <aside className="sidebar" ref={sidebarRef} onMouseMove={handleMouseMove}>
            <div className="sidebar-glow" aria-hidden="true" />

            <div className="sidebar-brand">
                <span className="sidebar-brand-name">MingleStudy</span>
            </div>

            <button className="sidebar-account" onClick={handleAccountClick}>
                <span className="sidebar-account-avatar">
                    {photoUrl ? (
                        <img src={photoUrl} alt={firstName} />
                    ) : (
                        <span>{firstName.charAt(0).toUpperCase()}</span>
                    )}
                </span>
                <span className="sidebar-account-text">
                    <span className="sidebar-account-name">{firstName}</span>
                    {bio && <span className="sidebar-account-bio">{bio}</span>}
                </span>
            </button>

            <nav className="sidebar-nav">
                <span className="sidebar-nav-label">Main Menu</span>

                <button
                    className={`nav-row ${active === "dashboard" ? "is-active" : ""}`}
                    onClick={handleDashboardClick}
                >
                    <span className="nav-row-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </span>
                    <span className="nav-row-label">Dashboard</span>
                </button>

                <button
                    className={`nav-row ${active === "calendar" ? "is-active" : ""}`}
                    onClick={handleCalendarClick}
                >
                    <span className="nav-row-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </span>
                    <span className="nav-row-label">Calendar</span>
                </button>

                <button
                    className={`nav-row ${active === "journal" ? "is-active" : ""}`}
                    onClick={handleJournalClick}
                >
                    <span className="nav-row-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </span>
                    <span className="nav-row-label">Journal</span>
                </button>

                <button
                    className={`nav-row ${active === "groups" ? "is-active" : ""}`}
                    onClick={handleGroupsClick}
                >
                    <span className="nav-row-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4.13a4 4 0 100-8 4 4 0 000 8zm6 4a4 4 0 10-8 0m8 0v0a4 4 0 01-4 4H9a4 4 0 01-4-4v0" />
                        </svg>
                    </span>
                    <span className="nav-row-label">Groups</span>
                </button>

                <button
                    className={`nav-row ${active === "library" ? "is-active" : ""}`}
                    onClick={handleLibraryClick}
                >
                    <span className="nav-row-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                    </span>
                    <span className="nav-row-label">Library</span>
                </button>
            </nav>

            <nav className="sidebar-nav sidebar-nav-secondary">
                <span className="sidebar-nav-label sidebar-nav-label-secondary">Settings &amp; News</span>

                <button
                    className={`nav-row ${active === "gazette" ? "is-active" : ""}`}
                    onClick={handleGazetteClick}
                >
                    <span className="nav-row-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 002 2zm0 0a2 2 0 002-2V9a1 1 0 00-1-1h-3m-6 3h6m-6 4h6m-8-8h.01" />
                        </svg>
                    </span>
                    <span className="nav-row-label">Gazette</span>
                </button>

                <button
                    className={`nav-row ${active === "settings" ? "is-active" : ""}`}
                    onClick={handleSettingsClick}
                >
                    <span className="nav-row-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </span>
                    <span className="nav-row-label">Settings</span>
                </button>
            </nav>

            <nav className="sidebar-tabbar">
                <button className="tab-item" onClick={handleDashboardClick}>
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Dashboard</span>
                </button>

                <button className="tab-item" onClick={handleLibraryClick}>
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <span>Library</span>
                </button>

                <button className="tab-item" onClick={handleJournalClick}>
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Journal</span>
                </button>

                <button className="tab-item" onClick={handleGroupsClick}>
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4.13a4 4 0 100-8 4 4 0 000 8zm6 4a4 4 0 10-8 0m8 0v0a4 4 0 01-4 4H9a4 4 0 01-4-4v0" />
                    </svg>
                    <span>Groups</span>
                </button>

                <button className="tab-item" onClick={handleGazetteClick}>
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 002 2zm0 0a2 2 0 002-2V9a1 1 0 00-1-1h-3m-6 3h6m-6 4h6m-8-8h.01" />
                    </svg>
                    <span>Gazette</span>
                </button>

                <button className="tab-item" onClick={handleSettingsClick}>
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                </button>
            </nav>
        </aside>
    );
}