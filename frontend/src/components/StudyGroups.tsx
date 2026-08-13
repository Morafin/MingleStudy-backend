import { studyGroups } from "../data/dashboardData";

function StudyGroups() {
    return (
        <section>
            <div className="section-heading">
                <h2>Your study groups</h2>
                <button className="text-button">See all</button>
            </div>

            {studyGroups.map((group) => (
                <article className="group-card" key={group.name}>
                    <div className={`group-icon ${group.colorClass}`}>{group.icon}</div>

                    <div className="group-content">
                        <h3>{group.name}</h3>
                        <p>
                            {group.course} · {group.members} members
                        </p>
                        <span>{group.update}</span>
                    </div>

                    <span className="chevron">›</span>
                </article>
            ))}
        </section>
    );
}

export default StudyGroups;