import { useState, useEffect, useCallback } from "react";
import Toast from "./Toast";
import { getMyEvents, createEvent, deleteEvent, type StudyEvent } from "../data/eventsApi";

type StudyCalendarProps = {
    initData: string;
};

type EventsMap = Record<string, StudyEvent[]>;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatDateKey = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
};

// Group flat events (each with a UTC ISO startTime) into a map keyed by the
// event's *local* calendar day, so a session at 11pm shows on the right tile
// regardless of what UTC date it crosses into.
function groupByLocalDay(events: StudyEvent[]): EventsMap {
    const map: EventsMap = {};
    for (const event of events) {
        const d = new Date(event.startTime);
        const key = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
        (map[key] ??= []).push(event);
    }
    for (const key of Object.keys(map)) {
        map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
}

function formatEventTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function StudyCalendar({ initData }: StudyCalendarProps) {
    const today = new Date();
    const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    const [viewDate, setViewDate] = useState(() => new Date());
    const [selectedKey, setSelectedKey] = useState<string>(todayKey);

    const [isAdding, setIsAdding] = useState(false);
    const [eventTitle, setEventTitle] = useState("");
    const [eventTime, setEventTime] = useState("16:00");

    const [events, setEvents] = useState<StudyEvent[]>([]);
    const [loading, setLoading] = useState(Boolean(initData));
    const [loadError, setLoadError] = useState<string | null>(null);

    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const refresh = useCallback(() => {
        if (!initData) { setLoading(false); return; }
        setLoading(true);
        setLoadError(null);
        getMyEvents(initData)
            .then(setEvents)
            .catch((e) => setLoadError((e as Error).message))
            .finally(() => setLoading(false));
    }, [initData]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const eventsByDay = groupByLocalDay(events);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleString("default", { month: "long" });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startingOffset = (firstDayOfMonth + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const handleDayGlowMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
    };

    const handleAddEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventTitle.trim() || !initData) return;

        setSubmitError(null);

        const timeString = eventTime || "12:00";
        const [sYear, sMonth, sDay] = selectedKey.split("-").map(Number);
        const [hours, minutes] = timeString.split(":").map(Number);
        const startDateTime = new Date(sYear, sMonth - 1, sDay, hours, minutes);

        setIsSubmitting(true);
        try {
            const saved = await createEvent(initData, eventTitle.trim(), startDateTime.toISOString());
            setEvents((prev) => [...prev, saved]);
            setToastMessage("Session added ✓");
            setEventTitle("");
            setIsAdding(false);
        } catch (err) {
            setSubmitError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        if (!initData) return;
        const previous = events;
        setEvents((prev) => prev.filter((evt) => evt.id !== eventId));
        try {
            await deleteEvent(initData, eventId);
        } catch (err) {
            setEvents(previous); // roll back on failure
            setSubmitError((err as Error).message);
        }
    };

    const activeEvents = eventsByDay[selectedKey] ?? [];

    const [sYear, sMonth, sDay] = selectedKey.split("-").map(Number);
    const selectedDateObj = new Date(sYear, sMonth - 1, sDay);
    const selectedFormattedText = selectedDateObj.toLocaleString("default", {
        month: "long",
        day: "numeric",
    });

    if (!initData) {
        return (
            <section className="calendar-section">
                <div className="section-heading">
                    <h2>Study Schedule</h2>
                </div>
                <p className="preview-banner">Open MingleStudy in Telegram to see your study schedule.</p>
            </section>
        );
    }

    return (
        <section className="calendar-section">
            {toastMessage && (
                <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
            )}

            <div className="section-heading">
                <h2>Study Schedule</h2>
            </div>

            <div className="calendar-card">
                {/* Month Navigation */}
                <div className="calendar-header">
                    <h3>{monthName} {year}</h3>
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button
                            type="button"
                            className="calendar-nav-btn bubble-button"
                            onClick={handlePrevMonth}
                            aria-label="Previous Month"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            className="calendar-nav-btn bubble-button"
                            onClick={handleNextMonth}
                            aria-label="Next Month"
                        >
                            ›
                        </button>
                    </div>
                </div>

                {loadError && (
                    <p className="form-error" style={{ margin: "0 0 12px" }}>
                        Couldn't load your schedule: {loadError}
                    </p>
                )}

                {/* Grid */}
                <div className="calendar-grid">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="weekday-header">
                            {day}
                        </div>
                    ))}

                    {Array.from({ length: startingOffset }).map((_, i) => (
                        <div key={`empty-${i}`} className="day-cell empty" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const currentTileKey = formatDateKey(year, month, dayNum);

                        const isToday = currentTileKey === todayKey;
                        const isSelected = currentTileKey === selectedKey;
                        const hasEvents = (eventsByDay[currentTileKey] ?? []).length > 0;

                        return (
                            <button
                                key={dayNum}
                                type="button"
                                className={`day-cell bubble-button glow-surface ${isToday ? "today" : ""} ${
                                    isSelected ? "selected" : ""
                                }`}
                                onMouseMove={handleDayGlowMove}
                                onClick={() => {
                                    setSelectedKey(currentTileKey);
                                    setIsAdding(false);
                                    setSubmitError(null);
                                }}
                            >
                                {dayNum}
                                {hasEvents && <span className="event-dot" />}
                            </button>
                        );
                    })}
                </div>

                {/* Agenda */}
                <div className="selected-day-events">
                    <div className="agenda-header">
                        <h4>Events for {selectedFormattedText}</h4>
                        {!isAdding && (
                            <button
                                type="button"
                                className="add-event-btn bubble-button"
                                onClick={() => {
                                    setIsAdding(true);
                                    setSubmitError(null);
                                }}
                            >
                                + Add Session
                            </button>
                        )}
                    </div>

                    {submitError && (
                        <p style={{ color: "#e53935", fontSize: "13px", marginBottom: "8px", wordBreak: "break-word" }}>
                            ⚠️ {submitError}
                        </p>
                    )}

                    {/* Form */}
                    {isAdding && (
                        <form onSubmit={handleAddEventSubmit} className="add-event-form">
                            <input
                                type="text"
                                placeholder="Study session title (e.g. Java Modding)"
                                value={eventTitle}
                                onChange={(e) => setEventTitle(e.target.value)}
                                autoFocus
                                required
                            />
                            <input
                                type="time"
                                value={eventTime}
                                onChange={(e) => setEventTime(e.target.value)}
                                required
                            />
                            <div className="add-event-actions">
                                <button
                                    type="button"
                                    className="btn-secondary bubble-button"
                                    onClick={() => setIsAdding(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary bubble-button" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Events List */}
                    {loading ? (
                        <p className="subtitle" style={{ fontSize: "13px" }}>Loading…</p>
                    ) : activeEvents.length > 0 ? (
                        <div className="ios-group">
                            {activeEvents.map((evt) => (
                                <div key={evt.id} className="ios-row event-chip">
                                    <div className="event-info">
                                        <span>{evt.title}</span>
                                        <span className="event-time">{formatEventTime(evt.startTime)}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="delete-event-btn bubble-button"
                                        onClick={() => handleDeleteEvent(evt.id)}
                                        aria-label="Delete Event"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !isAdding && (
                            <div className="calendar-empty-state">
                                <span className="empty-state-icon">📅</span>
                                <p className="subtitle" style={{ fontSize: "13px" }}>
                                    Nothing scheduled yet — add a session to start studying together.
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}