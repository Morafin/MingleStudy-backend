import { useEffect, useState } from "react";
import { getActivityStatus, getMyGroup, type MyGroup } from "../data/profileApi";
import { haptics } from "../data/haptics";

type GroupsPageProps = {
    initData: string;
    onEditProfile: () => void;
};

const BOT_USERNAME = "MingleStudyAppBot";

function GroupsSkeleton() {
    return (
        <div className="groups-summary-card">
            <div className="skeleton skeleton-line medium" />
            <div className="skeleton skeleton-line short" style={{ marginBottom: "18px" }} />
            <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton" style={{ height: "58px", borderRadius: "8px" }} />
                ))}
            </div>
        </div>
    );
}

function IconShare() {
    return (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <line x1="8.2" y1="10.8" x2="15.8" y2="6.2" />
            <line x1="8.2" y1="13.2" x2="15.8" y2="17.8" />
        </svg>
    );
}

export default function GroupsPage({ initData, onEditProfile }: GroupsPageProps) {
    const [group, setGroup] = useState<MyGroup | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!initData) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        getMyGroup(initData)
            .then(setGroup)
            .catch((err) => setError(err instanceof Error ? err.message : String(err)))
            .finally(() => setLoading(false));
    }, [initData]);

    async function handleInvite(universityId: number) {
        const link = `https://t.me/${BOT_USERNAME}?startapp=uni_${universityId}`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Join me on MingleStudy!")}`;

        const tg = window.Telegram?.WebApp as unknown as {
            openTelegramLink?: (url: string) => void;
            HapticFeedback?: { impactOccurred: (style: string) => void };
        } | undefined;

        haptics.tap("medium");

        if (tg?.openTelegramLink) {
            tg.openTelegramLink(shareUrl);
            return;
        }

        // Fallback outside Telegram: copy the link instead
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            haptics.success();
            setTimeout(() => setCopied(false), 2200);
        } catch {
            haptics.error();
        }
    }

    if (!initData) {
        return (
            <section className="groups-section">
                <div className="section-heading">
                    <h2>Groups</h2>
                </div>
                <p className="preview-banner">Open MingleStudy in Telegram to see your university group.</p>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="groups-section">
                <div className="section-heading">
                    <h2>Groups</h2>
                </div>
                <GroupsSkeleton />
            </section>
        );
    }

    if (error) {
        return (
            <section className="groups-section">
                <div className="section-heading">
                    <h2>Groups</h2>
                </div>
                <p className="form-error">Couldn't load your group: {error}</p>
            </section>
        );
    }

    if (!group || !group.hasUniversity || !group.university) {
        return (
            <section className="groups-section">
                <div className="section-heading">
                    <h2>Groups</h2>
                </div>
                <div className="groups-empty-state">
                    <span className="empty-state-icon">🎓</span>
                    <h3>No university set yet</h3>
                    <p className="subtitle">
                        Add your university to your profile and we'll automatically show you everyone else studying there.
                    </p>
                    <button type="button" className="btn-primary bubble-button" onClick={onEditProfile}>
                        Set my university
                    </button>
                </div>
            </section>
        );
    }

    const { university, memberCount, members } = group;

    return (
        <section className="groups-section">
            <div className="section-heading">
                <h2>Groups</h2>
                <button
                    type="button"
                    className="groups-invite-btn"
                    onClick={() => handleInvite(university.id)}
                >
                    <IconShare /> {copied ? "Link copied!" : "Invite classmate"}
                </button>
            </div>

            <div className="groups-summary-card">
                <h3>{university.name}</h3>
                <p className="subtitle">
                    {university.country} · {university.studentCount} student{university.studentCount === 1 ? "" : "s"} on MingleStudy
                </p>
            </div>

            {members.length === 0 ? (
                <div className="groups-empty-state">
                    <span className="empty-state-icon">👋</span>
                    <p className="subtitle">
                        No one else from {university.name} has joined yet. Invite your classmates!
                    </p>
                    <button
                        type="button"
                        className="groups-invite-btn"
                        onClick={() => handleInvite(university.id)}
                    >
                        <IconShare /> {copied ? "Link copied!" : "Invite a classmate"}
                    </button>
                </div>
            ) : (
                <>
                    <p className="ios-group-label">
                        {memberCount} classmate{memberCount === 1 ? "" : "s"} here with you
                    </p>
                    <div className="ios-group">
                        {members.map((member) => {
                            const status = getActivityStatus(member.lastSeenAt);
                            return (
                                <div key={member.telegramId} className="ios-row group-member-row">
                                    <div className="avatar group-member-ring">
                                        {member.photoUrl ? (
                                            <img src={member.photoUrl} alt={member.firstName} />
                                        ) : (
                                            <span>{member.firstName.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="ios-row-main">
                                        <span className="ios-row-title">
                                            {member.firstName} {member.lastName}
                                        </span>
                                        {member.username && (
                                            <span className="ios-row-sub">@{member.username}</span>
                                        )}
                                        {member.bio && <span className="ios-row-sub">{member.bio}</span>}
                                        {status && (
                                            <span className={`group-member-status ${status.isRecent ? "is-recent" : ""}`}>
                                                <span className="group-member-status-dot" />
                                                {status.label}
                                            </span>
                                        )}
                                    </div>
                                    {member.username && (
                                        <a
                                            className="group-member-message-btn"
                                            href={`https://t.me/${member.username}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => { e.stopPropagation(); haptics.tap("light"); }}
                                        >
                                            Message
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </section>
    );
}