type SidebarProps = {
    firstName: string;
    photoUrl?: string;
    onProfileClick?: () => void;
    onDashboardClick?: () => void; // Added new prop for home navigation
};

function Sidebar({ firstName, photoUrl, onProfileClick, onDashboardClick }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                {onProfileClick && (
                    <button
                        className="avatar sidebar-avatar bubble-button"
                        aria-label="Edit profile"
                        onClick={onProfileClick}
                    >
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={`${firstName}'s profile`}
                            />
                        ) : (
                            firstName.slice(0, 1).toUpperCase()
                        )}
                    </button>
                )}
            </div>

            <div className="sidebar-greeting">
                <p className="sidebar-eyebrow">MINGLESTUDY</p>
                <p className="sidebar-name">Hi, {firstName} 👋</p>
                <p className="sidebar-subtitle">
                    Find your people. Learn together.
                </p>
            </div>

            {/* New Navigation Section */}
            <nav className="sidebar-nav">
                <button
                    className="nav-item bubble-button"
                    onClick={onDashboardClick}
                    aria-label="Go to Dashboard"
                >
                    {/* Home SVG Icon */}
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="home-icon"
                    >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Dashboard</span>
                </button>
            </nav>
        </aside>
    );
}

export default Sidebar;