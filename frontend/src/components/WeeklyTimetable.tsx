import {
    ISFT_TIMETABLE,
    JS_DAY_TO_WEEKDAY,
    type TimetableLesson,
    type Weekday,
} from "../data/timetableData";

type WeeklyTimetableProps = {
    universityName: string | null | undefined;
};

// Only students whose profile university contains "ISFT" ever see this component.
// Matching is case-insensitive and substring-based so it covers both "ISFT" and
// "ISFT Institute" (or any future variant) without needing an exact string match.
function isIsftStudent(universityName: string | null | undefined): boolean {
    if (!universityName) return false;
    return universityName.toLowerCase().includes("isft");
}

function orderedDaysStartingToday(): Weekday[] {
    const todayIndex = new Date().getDay(); // 0 = Sunday .. 6 = Saturday
    const ordered: Weekday[] = [];

    for (let offset = 0; offset < 7; offset++) {
        const dayIndex = (todayIndex + offset) % 7;
        const day = JS_DAY_TO_WEEKDAY[dayIndex];
        if (day) ordered.push(day);
    }

    // De-duplicate while preserving first-seen order (7-day loop naturally covers
    // all 6 teaching days at least once before repeating).
    return Array.from(new Set(ordered));
}

function lessonsForDay(day: Weekday): TimetableLesson[] {
    return ISFT_TIMETABLE
        .filter((lesson) => lesson.day === day)
        .sort((a, b) => a.start.localeCompare(b.start));
}

function isToday(day: Weekday): boolean {
    const todayIndex = new Date().getDay();
    return JS_DAY_TO_WEEKDAY[todayIndex] === day;
}

export default function WeeklyTimetable({ universityName }: WeeklyTimetableProps) {
    if (!isIsftStudent(universityName)) return null;

    const days = orderedDaysStartingToday();
    const hasAnyLessons = days.some((day) => lessonsForDay(day).length > 0);

    return (
        <section className="timetable-section">
            <div className="section-heading">
                <h2>Class Schedule</h2>
            </div>

            <div className="timetable-card">
                {!hasAnyLessons && (
                    <p className="subtitle">No classes scheduled this week.</p>
                )}

                {days.map((day) => {
                    const lessons = lessonsForDay(day);
                    if (lessons.length === 0) return null;

                    return (
                        <div key={day} className="timetable-day-group">
                            <h4 className={`timetable-day-header ${isToday(day) ? "is-today" : ""}`}>
                                {day}
                                {isToday(day) && <span className="timetable-today-badge">Today</span>}
                            </h4>

                            <div className="timetable-lesson-list">
                                {lessons.map((lesson, i) => (
                                    <div key={`${day}-${lesson.start}-${i}`} className="timetable-lesson-row">
                                        <div className="timetable-lesson-info">
                                            <span className="timetable-lesson-subject">{lesson.subject}</span>
                                            <span className="timetable-lesson-type">
                                                ({lesson.type}){lesson.teacher ? ` · ${lesson.teacher}` : ""}
                                            </span>
                                        </div>
                                        <div className="timetable-lesson-time">
                                            <span>{lesson.start}</span>
                                            <span className="timetable-lesson-time-end">{lesson.end}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}