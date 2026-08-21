import type { ReactNode } from "react";

type SettingsPageProps = {
    firstName: string;
    photoUrl?: string;
    bio?: string | null;
    onProfileClick: () => void;
};

function IconChevronRight() {
    return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

function IconBell() {
    return (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    );
}

function IconMoon() {
    return (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
    );
}

function SettingsRow({
                         icon,
                         iconBg,
                         title,
                         subtitle,
                         onClick,
                         trailing,
                     }: {
    icon: ReactNode;
    iconBg: string;
    title: string;
    subtitle?: string;
    onClick?: () => void;
    trailing?: ReactNode;
}) {
    const content = (
        <>
            <span className="ios-row-icon" style={{ background: iconBg }}>
                {icon}
            </span>
            <span className="ios-row-main">
                <span className="ios-row-title">{title}</span>
                {subtitle && <span className="ios-row-sub">{subtitle}</span>}
            </span>
            {trailing ?? (onClick && (
                <span className="ios-row-chevron">
                    <IconChevronRight />
                </span>
            ))}
        </>
    );

    if (onClick) {
        return (
            <button type="button" className="ios-row" onClick={onClick}>
                {content}
            </button>
        );
    }

    return <div className="ios-row settings-row-static">{content}</div>;
}

export default function SettingsPage({ firstName, photoUrl, bio, onProfileClick }: SettingsPageProps) {
    return (
        <section className="settings-section">
            <div className="header">
                <div>
                    <p className="eyebrow">Settings</p>
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

            <p className="ios-group-label">Preferences</p>
            <div className="ios-group">
                <SettingsRow
                    icon={<IconBell />}
                    iconBg="var(--purple-mid)"
                    title="Notifications"
                    subtitle="Coming soon"
                />
                <SettingsRow
                    icon={<IconMoon />}
                    iconBg="var(--ink)"
                    title="Appearance"
                    subtitle="Follows your Telegram theme"
                />
            </div>
        </section>
    );
}