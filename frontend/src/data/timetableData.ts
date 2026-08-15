// ISFT Institute weekly class schedule (semester week 6, 2026-03-23 – 2026-03-29).
// Sourced directly from my.isft.uz/time-table. Update this array each semester
// or when the institute's schedule changes.

export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export interface TimetableLesson {
    day: Weekday;
    start: string; // "HH:MM"
    end: string;   // "HH:MM"
    subject: string;
    type: string;  // "Seminar", etc.
    teacher?: string;
    room?: string;
}

// Maps JS Date.getDay() (0 = Sunday .. 6 = Saturday) to weekday names used above.
export const JS_DAY_TO_WEEKDAY: Record<number, Weekday | null> = {
    0: null, // Sunday — no classes scheduled
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
};

export const ISFT_TIMETABLE: TimetableLesson[] = [
    // 08:30 – 09:50
    { day: "Monday", start: "08:30", end: "09:50", subject: "Physics 2", type: "Seminar" },
    { day: "Tuesday", start: "08:30", end: "09:50", subject: "Religious Studies", type: "Seminar" },
    { day: "Wednesday", start: "08:30", end: "09:50", subject: "Data Structures and Algorithms", type: "Seminar" },

    // 10:00 – 11:20
    { day: "Monday", start: "10:00", end: "11:20", subject: "Calculus 2", type: "Seminar" },
    { day: "Tuesday", start: "10:00", end: "11:20", subject: "Foreign Language 2", type: "Seminar" },
    { day: "Wednesday", start: "10:00", end: "11:20", subject: "Philosophy", type: "Seminar" },

    // 11:30 – 12:50
    { day: "Monday", start: "11:30", end: "12:50", subject: "Programming 2", type: "Seminar" },
    { day: "Tuesday", start: "11:30", end: "12:50", subject: "Calculus 2", type: "Seminar" },

    // 15:00 – 16:20
    { day: "Thursday", start: "15:00", end: "16:20", subject: "Physics 2", type: "Seminar", teacher: "Ulasheva Z. A." },
    { day: "Friday", start: "15:00", end: "16:20", subject: "Calculus 2", type: "Seminar", teacher: "Husanov A. Z." },
    { day: "Saturday", start: "15:00", end: "16:20", subject: "Religious Studies", type: "Seminar", teacher: "Aytbayev M. Y." },

    // 16:30 – 17:50
    { day: "Thursday", start: "16:30", end: "17:50", subject: "Data Structures and Algorithms", type: "Seminar", teacher: "Nematova Z. F." },
    { day: "Friday", start: "16:30", end: "17:50", subject: "Philosophy", type: "Seminar", teacher: "Kadirova Z. R." },
    { day: "Saturday", start: "16:30", end: "17:50", subject: "Programming 2", type: "Seminar", teacher: "Boborayimov O. X." },

    // 18:00 – 19:20
    { day: "Saturday", start: "18:00", end: "19:20", subject: "Foreign Language 2", type: "Seminar", teacher: "Xudayberdiyeva D. I." },
];