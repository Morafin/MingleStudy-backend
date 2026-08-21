type ThemePreference = "system" | "light" | "dark";

type SettingsPageProps = {
    firstName: string;
    photoUrl?: string;
    bio?: string | null;
    onProfileClick: () => void;
    themePreference: ThemePreference;
    onThemePreferenceChange: (preference: ThemePreference) => void;
};

function IconChevronRight() {
    return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
];

export default function SettingsPage({
                                         firstName,
                                         photoUrl,
                                         bio,
                                         onProfileClick,
                                         themePreference,
                                         onThemePreferenceChange,
                                     }: SettingsPageProps) {
    return (
        <section className="settings-section">
            <div className="header">
                <div>
                    <h1>Settings</h1>
                    <p className="subtitle">Manage your account and preferences.</p>
                </div>
            </div>

            <p className="ios-group-label">Account</p>
            <div className="ios-group">
                <button type="button" className="ios-row" onClick={onProfileClick}>
                    <span className="settings-avatar">
                        {photoUrl ? (
                            <img src={photoUrl} alt={firstName} />
                        ) : (
                            <span>{firstName.charAt(0).toUpperCase()}</span>
                        )}
                    </span>
                    <span className="ios-row-main">
                        <span className="ios-row-title">{firstName}</span>
                        <span className="ios-row-sub">{bio || "Edit your profile"}</span>
                    </span>
                    <span className="ios-row-chevron">
                        <IconChevronRight />
                    </span>
                </button>
            </div>

            <p className="ios-group-label">Appearance</p>
            <div className="ios-group settings-appearance-group">
                <div className="settings-segmented" role="tablist" aria-label="Appearance">
                    {THEME_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            role="tab"
                            aria-selected={themePreference === option.value}
                            className={`settings-segment ${themePreference === option.value ? "is-active" : ""}`}
                            onClick={() => onThemePreferenceChange(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}