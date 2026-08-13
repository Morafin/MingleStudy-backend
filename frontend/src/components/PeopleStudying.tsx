import { activeSubjects } from "../data/dashboardData";

function PeopleStudying() {
    return (
        <section>
            <div className="section-heading">
                <h2>People studying now</h2>
                <button className="text-button">Explore</button>
            </div>

            <div className="subjects">
                {activeSubjects.map((subject) => (
                    <button key={subject.label}>
                        {subject.label} <b>{subject.count}</b>
                    </button>
                ))}
            </div>
        </section>
    );
}

export default PeopleStudying;