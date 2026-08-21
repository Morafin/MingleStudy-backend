import { useState } from "react";

type SidebarProps = {
    firstName: string;
    photoUrl?: string;
    bio?: string | null;
    onProfileClick: () => void;
    onDashboardClick: () => void;
    onGroupsClick: () => void;
    onJournalClick: () => void;
};

type NavKey = "dashboard" | "calendar" | "journal" | "groups" | "profile";

export default function Sidebar({
                                    firstName,
                                    photoUrl,
                                    bio,
                                    onProfileClick,
                                    onDashboardClick,
                                    onGroupsClick,
                                    onJournalClick,
                                }: SidebarProps) {
    // Tracks which row shows the active highlight in the desktop list.
    // The app doesn't have separate routes for Dashboard vs. Calendar (Calendar
    // just scrolls within the dashboard view), so this is tracked locally here
    // rather than threaded through App.tsx — clicking a row highlights it directly.
    const [active, setActive] = useState<NavKey>("dashboard");

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

    const handleProfileClick = () => {
        setActive("profile");
        onProfileClick();
    };

    return (
        <aside className="sidebar">
            {/* Desktop: macOS-style flat list. Hidden on mobile via sidebar.css. */}
            <div className="sidebar-brand">
                <span className="sidebar-brand-name">MingleStudy</span>
            </div>

            <button className="sidebar-account" onClick={handleProfileClick}>
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
                    className={`nav-row ${active === "profile" ? "is-active" : ""}`}
                    onClick={handleProfileClick}
                >
                    <span className="nav-row-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </span>
                    <span className="nav-row-label">Profile</span>
                </button>
            </nav>

            {/* Mobile: unchanged iOS-style bottom tab bar. Hidden on desktop via sidebar.css. */}
            <nav className="sidebar-tabbar">
                <button className="tab-item" onClick={handleDashboardClick}>
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Dashboard</span>
                </button>

                <button className="tab-item" onClick={handleCalendarClick}>
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Calendar</span>
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

                <button className="tab-item" onClick={handleProfileClick}>
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                </button>
            </nav>
        </aside>
    );
}