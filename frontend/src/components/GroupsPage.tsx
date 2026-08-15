import { useEffect, useState } from "react";
import { getMyGroup, type MyGroup } from "../data/profileApi";

type GroupsPageProps = {
    initData: string;
    onEditProfile: () => void;
};

export default function GroupsPage({ initData, onEditProfile }: GroupsPageProps) {
    const [group, setGroup] = useState<MyGroup | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                <p className="status-message">Loading your group…</p>
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
                <div className="groups-card groups-empty-state">
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
            </div>

            <div className="groups-card">
                <div className="groups-university-header">
                    <h3>{university.name}</h3>
                    <p className="subtitle">
                        {university.country} · {university.studentCount} student{university.studentCount === 1 ? "" : "s"} on MingleStudy
                    </p>
                </div>

                {members.length === 0 ? (
                    <p className="subtitle" style={{ marginTop: "12px" }}>
                        No one else from {university.name} has joined yet. Invite your classmates!
                    </p>
                ) : (
                    <>
                        <p className="groups-member-count">
                            {memberCount} classmate{memberCount === 1 ? "" : "s"} here with you
                        </p>
                        <div className="group-member-list">
                            {members.map((member) => (
                                <div key={member.telegramId} className="group-member">
                                    <div className="avatar group-member-avatar">
                                        {member.photoUrl ? (
                                            <img src={member.photoUrl} alt={member.firstName} />
                                        ) : (
                                            <span>{member.firstName.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="group-member-info">
                                        <span className="group-member-name">
                                            {member.firstName} {member.lastName}
                                        </span>
                                        {member.username && (
                                            <span className="group-member-username">@{member.username}</span>
                                        )}
                                        {member.bio && <span className="group-member-bio">{member.bio}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}