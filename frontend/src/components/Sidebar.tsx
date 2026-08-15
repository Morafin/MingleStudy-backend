type SidebarProps = {
    firstName: string;
    photoUrl?: string;
    onProfileClick: () => void;
    onDashboardClick: () => void;
    onGroupsClick: () => void;
};

export default function Sidebar({
                                    firstName,
                                    photoUrl,
                                    onProfileClick,
                                    onDashboardClick,
                                    onGroupsClick,
                                }: SidebarProps) {
    const handleCalendarClick = () => {
        // Return to main dashboard first if editing profile
        onDashboardClick();
        // Scroll smoothly to calendar section
        setTimeout(() => {
            document.querySelector(".calendar-section")?.scrollIntoView({ behavior: "smooth" });
        }, 50);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                <button className="sidebar-avatar bubble-button" onClick={onProfileClick}>
                    {photoUrl ? (
                        <img src={photoUrl} alt={firstName} />
                    ) : (
                        <span>{firstName.charAt(0).toUpperCase()}</span>
                    )}
                </button>
            </div>

            <div className="sidebar-greeting">
                <p className="sidebar-eyebrow" onClick={onDashboardClick} style={{ cursor: "pointer" }}>
                    MINGLESTUDY
                </p>
                <h2 className="sidebar-name">Hi, {firstName} 👋</h2>
                <p className="sidebar-subtitle">Find your people. Learn together.</p>
            </div>

            <nav className="sidebar-nav">
                {/* Dashboard Button */}
                <button className="nav-item bubble-button" onClick={onDashboardClick}>
                    <svg className="home-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                </button>

                {/* Calendar Button */}
                <button className="nav-item bubble-button" onClick={handleCalendarClick}>
                    <svg className="home-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendar
                </button>

                {/* Groups Button */}
                <button className="nav-item bubble-button" onClick={onGroupsClick}>
                    <svg className="home-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4.13a4 4 0 100-8 4 4 0 000 8zm6 4a4 4 0 10-8 0m8 0v0a4 4 0 01-4 4H9a4 4 0 01-4-4v0" />
                    </svg>
                    Groups
                </button>

                {/* Edit Profile Button */}
                <button className="nav-item bubble-button" onClick={onProfileClick}>
                    <svg className="home-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                </button>
            </nav>
        </aside>
    );
}