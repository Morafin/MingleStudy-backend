import { useMemo, useState } from "react";
import {
    type ScheduleEntry,
    type ScheduleEntryInput,
    type Weekday,
} from "../data/scheduleApi";
import {
    useCreateScheduleEntriesBulk,
    useCreateScheduleEntry,
    useDeleteScheduleEntry,
    useMySchedule,
    useUpdateScheduleEntry,
} from "../data/useScheduleQueries";
import { ISFT_PRESET, JS_DAY_TO_WEEKDAY, WEEKDAYS, dayLabel } from "../data/timetableData";
import { haptics } from "../data/haptics";

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
    const { data: rawEntries, isLoading: loading, error: fetchError } = useMySchedule(initData);
    const entries = rawEntries ?? [];
    const loadErrorMessage = fetchError ? (fetchError as Error).message : null;

    const createMutation = useCreateScheduleEntry(initData);
    const updateMutation = useUpdateScheduleEntry(initData);
    const bulkMutation = useCreateScheduleEntriesBulk(initData);
    const deleteMutation = useDeleteScheduleEntry(initData);

    const saving = createMutation.isPending || updateMutation.isPending;
    const deletingId = deleteMutation.isPending ? (deleteMutation.variables as number) : null;

    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [form, setForm] = useState<ScheduleEntryInput>(EMPTY_FORM);

    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const days = useMemo(orderedDaysStartingToday, []);

    const lessonsForDay = (day: Weekday) =>
        entries.filter((e) => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

    const hasAnyLessons = entries.length > 0;
    const showIsftImport = isIsftStudent(universityName) && entries.length === 0 && !loading;

    const pendingDeleteLesson = pendingDeleteId !== null
        ? entries.find((e) => e.id === pendingDeleteId) ?? null
        : null;

    const openNewForm = (day?: Weekday) => {
        haptics.tap("light");
        setForm({ ...EMPTY_FORM, day: day ?? "MONDAY" });
        setEditingId("new");
        setError(null);
    };

    const openEditForm = (entry: ScheduleEntry) => {
        haptics.tap("light");
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
        if (!form.subject.trim()) { setError("Subject is required."); haptics.error(); return; }
        if (form.endTime <= form.startTime) { setError("End time must be after start time."); haptics.error(); return; }

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
                await createMutation.mutateAsync(payload);
            } else if (typeof editingId === "number") {
                await updateMutation.mutateAsync({ id: editingId, entry: payload });
            }
            haptics.success();
            closeForm();
        } catch (e) {
            setError((e as Error).message);
            haptics.error();
        }
    };

    const requestDelete = (id: number) => {
        haptics.tap("medium");
        setError(null);
        setPendingDeleteId(id);
    };

    const cancelDelete = () => {
        setPendingDeleteId(null);
    };

    const confirmDelete = async () => {
        if (pendingDeleteId === null) return;
        const id = pendingDeleteId;
        setError(null);
        try {
            await deleteMutation.mutateAsync(id);
            haptics.warning();
        } catch (e) {
            setError((e as Error).message);
            haptics.error();
        } finally {
            setPendingDeleteId(null);
        }
    };

    const handleIsftImport = async () => {
        setError(null);
        try {
            await bulkMutation.mutateAsync(ISFT_PRESET);
            haptics.success();
        } catch (e) {
            setError((e as Error).message);
            haptics.error();
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
                {(loadErrorMessage || error) && !pendingDeleteLesson && editingId === null && (
                    <p className="schedule-error">{error ?? loadErrorMessage}</p>
                )}

                {!loading && showIsftImport && (
                    <div className="schedule-import-banner">
                        <p className="subtitle">Start from ISFT's default weekly schedule?</p>
                        <button className="schedule-add-btn" onClick={handleIsftImport} disabled={bulkMutation.isPending}>
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
                            <h4 className={`ios-group-label timetable-day-header ${isToday(day) ? "is-today" : ""}`}>
                                {dayLabel(day)}
                                {isToday(day) && <span className="timetable-today-badge">Today</span>}
                            </h4>

                            <div className="ios-group">
                                {lessons.map((lesson) => (
                                    <div key={lesson.id} className="ios-row timetable-lesson-row">
                                        <div className="ios-row-main timetable-lesson-info">
                                            <span className="ios-row-title timetable-lesson-subject">{lesson.subject}</span>
                                            <span className="ios-row-sub timetable-lesson-type">
                                                ({lesson.type}){lesson.teacher ? ` · ${lesson.teacher}` : ""}
                                                {lesson.room ? ` · ${lesson.room}` : ""}
                                            </span>
                                        </div>
                                        <div className="ios-row-value timetable-lesson-time">
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
                <div className="ios-sheet-backdrop" onClick={closeForm}>
                    <div className="ios-sheet" onClick={(e) => e.stopPropagation()}>
                        <div className="ios-sheet-navbar">
                            <button className="ios-sheet-nav-btn" onClick={closeForm} disabled={saving}>
                                Cancel
                            </button>
                            <h3 className="ios-sheet-nav-title">
                                {editingId === "new" ? "Add Class" : "Edit Class"}
                            </h3>
                            <button
                                className="ios-sheet-nav-btn ios-sheet-nav-btn-primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving…" : "Save"}
                            </button>
                        </div>

                        <div className="ios-sheet-body">
                            {error && <p className="ios-sheet-error">{error}</p>}

                            <div className="ios-sheet-group">
                                <div className="ios-sheet-row">
                                    <span className="ios-sheet-label">Day</span>
                                    <select
                                        className="ios-sheet-input ios-sheet-select"
                                        value={form.day}
                                        onChange={(e) => setForm({ ...form, day: e.target.value as Weekday })}
                                    >
                                        {WEEKDAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                </div>
                                <div className="ios-sheet-row">
                                    <span className="ios-sheet-label">Starts</span>
                                    <input
                                        className="ios-sheet-input"
                                        type="time"
                                        value={form.startTime}
                                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="ios-sheet-row">
                                    <span className="ios-sheet-label">Ends</span>
                                    <input
                                        className="ios-sheet-input"
                                        type="time"
                                        value={form.endTime}
                                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="ios-sheet-group">
                                <div className="ios-sheet-row">
                                    <span className="ios-sheet-label">Subject</span>
                                    <input
                                        className="ios-sheet-input"
                                        type="text"
                                        value={form.subject}
                                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        placeholder="e.g. Calculus 2"
                                    />
                                </div>
                                <div className="ios-sheet-row">
                                    <span className="ios-sheet-label">Type</span>
                                    <input
                                        className="ios-sheet-input"
                                        type="text"
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        placeholder="Seminar, Lecture, Lab…"
                                    />
                                </div>
                            </div>

                            <div className="ios-sheet-group">
                                <div className="ios-sheet-row">
                                    <span className="ios-sheet-label">Teacher</span>
                                    <input
                                        className="ios-sheet-input"
                                        type="text"
                                        value={form.teacher ?? ""}
                                        onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="ios-sheet-row">
                                    <span className="ios-sheet-label">Room</span>
                                    <input
                                        className="ios-sheet-input"
                                        type="text"
                                        value={form.room ?? ""}
                                        onChange={(e) => setForm({ ...form, room: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {pendingDeleteLesson && (
                <div className="ios-alert-backdrop" onClick={cancelDelete}>
                    <div className="ios-alert" onClick={(e) => e.stopPropagation()}>
                        <div className="ios-alert-body">
                            <h3 className="ios-alert-title">Remove Class?</h3>
                            <p className="ios-alert-message">
                                "{pendingDeleteLesson.subject}" on {dayLabel(pendingDeleteLesson.day)} at {pendingDeleteLesson.startTime} will be removed from your schedule.
                            </p>
                            {error && <p className="ios-alert-error">{error}</p>}
                        </div>

                        <div className="ios-alert-actions">
                            <button
                                className="ios-alert-btn"
                                onClick={cancelDelete}
                                disabled={deleteMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                className="ios-alert-btn ios-alert-btn-destructive"
                                onClick={confirmDelete}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? "Removing…" : "Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
