import { useEffect, useMemo, useState } from "react";
import {
    createScheduleEntriesBulk,
    createScheduleEntry,
    deleteScheduleEntry,
    getMySchedule,
    updateScheduleEntry,
    type ScheduleEntry,
    type ScheduleEntryInput,
    type Weekday,
} from "../data/scheduleApi";
import { ISFT_PRESET, JS_DAY_TO_WEEKDAY, WEEKDAYS, dayLabel } from "../data/timetableData";

type WeeklyTimetableProps = {
    initData: string;
    universityName?: string | null;
};

const EMPTY_FORM: ScheduleEntryInput = {
    day: "MONDAY",
    startTime: "09:00",
    endTime: "10:20",
    subject: "",
    type: "Seminar",
    teacher: "",
    room: "",
};

function isIsftStudent(universityName: string | null | undefined): boolean {
    if (!universityName) return false;
    return universityName.toLowerCase().includes("isft");
}

function orderedDaysStartingToday(): Weekday[] {
    const todayIndex = new Date().getDay();
    const ordered: Weekday[] = [];
    for (let offset = 0; offset < 7; offset++) {
        ordered.push(JS_DAY_TO_WEEKDAY[(todayIndex + offset) % 7]);
    }
    return ordered;
}

function isToday(day: Weekday): boolean {
    return JS_DAY_TO_WEEKDAY[new Date().getDay()] === day;
}

export default function WeeklyTimetable({ initData, universityName }: WeeklyTimetableProps) {
    const [entries, setEntries] = useState<ScheduleEntry[]>([]);
    const [loading, setLoading] = useState(Boolean(initData));
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [form, setForm] = useState<ScheduleEntryInput>(EMPTY_FORM);

    // Track the lesson pending delete confirmation (in-app modal instead of window.confirm,
    // since Telegram's WebView silently suppresses repeated native confirm() dialogs after a
    // few calls — it just returns false with no UI, which looks like the delete button "stops working").
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    // Track which entry is actively being deleted so we can disable its button and prevent
    // double-fires from a fast double-tap while the request is in flight.
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        if (!initData) { setLoading(false); return; }
        setLoading(true);
        getMySchedule(initData)
            .then(setEntries)
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, [initData]);

    const days = useMemo(orderedDaysStartingToday, []);

    const lessonsForDay = (day: Weekday) =>
        entries.filter((e) => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

    const hasAnyLessons = entries.length > 0;
    const showIsftImport = isIsftStudent(universityName) && entries.length === 0 && !loading;

    const pendingDeleteLesson = pendingDeleteId !== null
        ? entries.find((e) => e.id === pendingDeleteId) ?? null
        : null;

    const openNewForm = (day?: Weekday) => {
        setForm({ ...EMPTY_FORM, day: day ?? "MONDAY" });
        setEditingId("new");
        setError(null);
    };

    const openEditForm = (entry: ScheduleEntry) => {
        setForm({
            day: entry.day,
            startTime: entry.startTime,
            endTime: entry.endTime,
            subject: entry.subject,
            type: entry.type,
            teacher: entry.teacher ?? "",
            room: entry.room ?? "",
        });
        setEditingId(entry.id);
        setError(null);
    };

    const closeForm = () => {
        setEditingId(null);
        setError(null);
    };

    const handleSave = async () => {
        if (!form.subject.trim()) { setError("Subject is required."); return; }
        if (form.endTime <= form.startTime) { setError("End time must be after start time."); return; }

        setSaving(true);
        setError(null);
        try {
            const payload: ScheduleEntryInput = {
                ...form,
                subject: form.subject.trim(),
                type: form.type.trim() || "Seminar",
                teacher: form.teacher?.trim() || undefined,
                room: form.room?.trim() || undefined,
            };
            if (editingId === "new") {
                const created = await createScheduleEntry(initData, payload);
                setEntries((prev) => [...prev, created]);
            } else if (typeof editingId === "number") {
                const updated = await updateScheduleEntry(initData, editingId, payload);
                setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
            }
            closeForm();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const requestDelete = (id: number) => {
        setError(null);
        setPendingDeleteId(id);
    };

    const cancelDelete = () => {
        setPendingDeleteId(null);
    };

    const confirmDelete = async () => {
        if (pendingDeleteId === null) return;
        const id = pendingDeleteId;
        setDeletingId(id);
        setError(null);
        try {
            await deleteScheduleEntry(initData, id);
            setEntries((prev) => prev.filter((e) => e.id !== id));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setDeletingId(null);
            setPendingDeleteId(null);
        }
    };

    const handleIsftImport = async () => {
        setSaving(true);
        setError(null);
        try {
            const created = await createScheduleEntriesBulk(initData, ISFT_PRESET);
            setEntries(created);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (!initData) return null;

    return (
        <section className="timetable-section">
            <div className="section-heading schedule-heading">
                <h2>Class Schedule</h2>
                <button className="schedule-add-btn" onClick={() => openNewForm()} disabled={saving}>
                    + Add class
                </button>
            </div>

            <div className="timetable-card">
                {loading && <p className="subtitle">Loading your schedule…</p>}
                {error && <p className="schedule-error">{error}</p>}

                {!loading && showIsftImport && (
                    <div className="schedule-import-banner">
                        <p className="subtitle">Start from ISFT's default weekly schedule?</p>
                        <button className="schedule-add-btn" onClick={handleIsftImport} disabled={saving}>
                            Import ISFT schedule
                        </button>
                    </div>
                )}

                {!loading && !hasAnyLessons && !showIsftImport && (
                    <p className="subtitle">No classes scheduled yet. Add your first class above.</p>
                )}

                {!loading && days.map((day) => {
                    const lessons = lessonsForDay(day);
                    if (lessons.length === 0) return null;

                    return (
                        <div key={day} className="timetable-day-group">
                            <h4 className={`timetable-day-header ${isToday(day) ? "is-today" : ""}`}>
                                {dayLabel(day)}
                                {isToday(day) && <span className="timetable-today-badge">Today</span>}
                            </h4>

                            <div className="timetable-lesson-list">
                                {lessons.map((lesson) => (
                                    <div key={lesson.id} className="timetable-lesson-row">
                                        <div className="timetable-lesson-info">
                                            <span className="timetable-lesson-subject">{lesson.subject}</span>
                                            <span className="timetable-lesson-type">
                                                ({lesson.type}){lesson.teacher ? ` · ${lesson.teacher}` : ""}
                                                {lesson.room ? ` · ${lesson.room}` : ""}
                                            </span>
                                        </div>
                                        <div className="timetable-lesson-time">
                                            <span>{lesson.startTime}</span>
                                            <span className="timetable-lesson-time-end">{lesson.endTime}</span>
                                        </div>
                                        <div className="schedule-lesson-actions">
                                            <button
                                                className="schedule-icon-btn"
                                                onClick={(e) => { e.stopPropagation(); openEditForm(lesson); }}
                                                aria-label="Edit class"
                                                disabled={deletingId === lesson.id}
                                            >
                                                ✎
                                            </button>
                                            <button
                                                className="schedule-icon-btn"
                                                onClick={(e) => { e.stopPropagation(); requestDelete(lesson.id); }}
                                                aria-label="Remove class"
                                                disabled={deletingId === lesson.id}
                                            >
                                                {deletingId === lesson.id ? "…" : "✕"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {editingId !== null && (
                <div className="schedule-modal-backdrop" onClick={closeForm}>
                    <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingId === "new" ? "Add class" : "Edit class"}</h3>

                        <label className="schedule-field">
                            Day
                            <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as Weekday })}>
                                {WEEKDAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                            </select>
                        </label>

                        <div className="schedule-field-row">
                            <label className="schedule-field">
                                Start
                                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                            </label>
                            <label className="schedule-field">
                                End
                                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                            </label>
                        </div>

                        <label className="schedule-field">
                            Subject
                            <input
                                type="text"
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                placeholder="e.g. Calculus 2"
                            />
                        </label>

                        <label className="schedule-field">
                            Type
                            <input
                                type="text"
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                placeholder="Seminar, Lecture, Lab…"
                            />
                        </label>

                        <div className="schedule-field-row">
                            <label className="schedule-field">
                                Teacher (optional)
                                <input type="text" value={form.teacher ?? ""} onChange={(e) => setForm({ ...form, teacher: e.target.value })} />
                            </label>
                            <label className="schedule-field">
                                Room (optional)
                                <input type="text" value={form.room ?? ""} onChange={(e) => setForm({ ...form, room: e.target.value })} />
                            </label>
                        </div>

                        {error && <p className="schedule-error">{error}</p>}

                        <div className="schedule-modal-actions">
                            <button className="schedule-cancel-btn" onClick={closeForm} disabled={saving}>Cancel</button>
                            <button className="schedule-save-btn" onClick={handleSave} disabled={saving}>
                                {saving ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {pendingDeleteLesson && (
                <div className="schedule-modal-backdrop" onClick={cancelDelete}>
                    <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Remove class?</h3>
                        <p className="subtitle">
                            {pendingDeleteLesson.subject} on {dayLabel(pendingDeleteLesson.day)} at {pendingDeleteLesson.startTime} will be removed from your schedule.
                        </p>

                        {error && <p className="schedule-error">{error}</p>}

                        <div className="schedule-modal-actions">
                            <button className="schedule-cancel-btn" onClick={cancelDelete} disabled={deletingId !== null}>
                                Cancel
                            </button>
                            <button className="schedule-save-btn" onClick={confirmDelete} disabled={deletingId !== null}>
                                {deletingId !== null ? "Removing…" : "Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}