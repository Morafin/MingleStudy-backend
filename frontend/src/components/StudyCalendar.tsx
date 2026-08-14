import { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";

interface StudyEvent {
    id: string;
    title: string;
    time: string;
}

type EventsMap = Record<string, StudyEvent[]>;

const STORAGE_KEY = "minglestudy_calendar_events";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULT_EVENTS: EventsMap = {
    "2026-08-14": [{ id: "1", title: "Discrete Math Prep", time: "16:00" }],
    "2026-08-22": [{ id: "2", title: "Algorithmic Analysis Group", time: "18:30" }],
    "2026-08-25": [{ id: "3", title: "OS Final Review", time: "14:00" }],
};

const formatDateKey = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
};

export default function StudyCalendar() {
    const today = new Date();
    const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    const [viewDate, setViewDate] = useState(() => new Date());
    const [selectedKey, setSelectedKey] = useState<string>(todayKey);

    const [isAdding, setIsAdding] = useState(false);
    const [eventTitle, setEventTitle] = useState("");
    const [eventTime, setEventTime] = useState("16:00");

    // Persistent storage initialization from LocalStorage
    const [events, setEvents] = useState<EventsMap>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
        } catch {
            return DEFAULT_EVENTS;
        }
    });

    // Automatically save to LocalStorage whenever events state changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        } catch (err) {
            console.error("Failed to save calendar events to localStorage", err);
        }
    }, [events]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleString("default", { month: "long" });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startingOffset = (firstDayOfMonth + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const handleAddEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventTitle.trim()) return;

        const timeString = eventTime || "12:00";

        // 1. Save locally in React state
        const newEvt: StudyEvent = {
            id: Date.now().toString(),
            title: eventTitle.trim(),
            time: timeString,
        };

        setEvents((prev) => ({
            ...prev,
            [selectedKey]: [...(prev[selectedKey] ?? []), newEvt],
        }));

        // 2. Schedule Telegram notification via Spring Boot API
        const telegramId = WebApp.initDataUnsafe?.user?.id;

        if (telegramId) {
            // Calculate start date & time as UTC ISO string
            const [sYear, sMonth, sDay] = selectedKey.split("-").map(Number);
            const [hours, minutes] = timeString.split(":").map(Number);
            const startDateTime = new Date(sYear, sMonth - 1, sDay, hours, minutes);

            try {
                await fetch("https://minglestudy-backend-production.up.railway.app/api/events", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        telegramId: telegramId,
                        title: eventTitle.trim(),
                        startTime: startDateTime.toISOString(),
                    }),
                });
            } catch (err) {
                console.error("Failed to sync event with notification server:", err);
            }
        } else {
            console.warn("Telegram User ID not available; event saved locally only.");
        }

        setEventTitle("");
        setIsAdding(false);
    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents((prev) => {
            const currentList = prev[selectedKey] ?? [];
            const updatedList = currentList.filter((evt) => evt.id !== eventId);
            const updatedEvents = { ...prev };

            if (updatedList.length === 0) {
                delete updatedEvents[selectedKey];
            } else {
                updatedEvents[selectedKey] = updatedList;
            }

            return updatedEvents;
        });
    };

    const activeEvents = events[selectedKey] ?? [];

    const [sYear, sMonth, sDay] = selectedKey.split("-").map(Number);
    const selectedDateObj = new Date(sYear, sMonth - 1, sDay);
    const selectedFormattedText = selectedDateObj.toLocaleString("default", {
        month: "long",
        day: "numeric",
    });

    return (
        <section className="calendar-section">
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
                        const hasEvents = (events[currentTileKey] ?? []).length > 0;

                        return (
                            <button
                                key={dayNum}
                                type="button"
                                className={`day-cell bubble-button ${isToday ? "today" : ""} ${
                                    isSelected ? "selected" : ""
                                }`}
                                onClick={() => {
                                    setSelectedKey(currentTileKey);
                                    setIsAdding(false);
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
                                onClick={() => setIsAdding(true)}
                            >
                                + Add Session
                            </button>
                        )}
                    </div>

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
                                <button type="submit" className="btn-primary bubble-button">
                                    Save
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Events List */}
                    {activeEvents.length > 0 ? (
                        <div style={{ display: "grid", gap: "8px", marginTop: "10px" }}>
                            {activeEvents.map((evt) => (
                                <div key={evt.id} className="event-chip">
                                    <div className="event-info">
                                        <span>{evt.title}</span>
                                        <span className="event-time">{evt.time}</span>
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
                            <p className="subtitle" style={{ fontSize: "13px", marginTop: "8px" }}>
                                No study sessions scheduled for this day.
                            </p>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}