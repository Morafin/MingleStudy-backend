import type { ScheduleEntryInput, Weekday } from "./scheduleApi";

export const WEEKDAYS: { value: Weekday; label: string }[] = [
    { value: "MONDAY", label: "Monday" },
    { value: "TUESDAY", label: "Tuesday" },
    { value: "WEDNESDAY", label: "Wednesday" },
    { value: "THURSDAY", label: "Thursday" },
    { value: "FRIDAY", label: "Friday" },
    { value: "SATURDAY", label: "Saturday" },
    { value: "SUNDAY", label: "Sunday" },
];

export const dayLabel = (day: Weekday): string =>
    WEEKDAYS.find((d) => d.value === day)?.label ?? day;

// Maps JS Date.getDay() (0 = Sunday .. 6 = Saturday) to backend Weekday enum values.
export const JS_DAY_TO_WEEKDAY: Record<number, Weekday> = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY",
};

// ISFT Institute's semester week-6 schedule (2026-03-23 – 2026-03-29), preserved here
// so ISFT students can one-click import it into their own editable schedule instead
// of retyping it. Every other student just starts with a blank schedule.
export const ISFT_PRESET: ScheduleEntryInput[] = [
    { day: "MONDAY", startTime: "08:30", endTime: "09:50", subject: "Physics 2", type: "Seminar" },
    { day: "TUESDAY", startTime: "08:30", endTime: "09:50", subject: "Religious Studies", type: "Seminar" },
    { day: "WEDNESDAY", startTime: "08:30", endTime: "09:50", subject: "Data Structures and Algorithms", type: "Seminar" },
    { day: "MONDAY", startTime: "10:00", endTime: "11:20", subject: "Calculus 2", type: "Seminar" },
    { day: "TUESDAY", startTime: "10:00", endTime: "11:20", subject: "Foreign Language 2", type: "Seminar" },
    { day: "WEDNESDAY", startTime: "10:00", endTime: "11:20", subject: "Philosophy", type: "Seminar" },
    { day: "MONDAY", startTime: "11:30", endTime: "12:50", subject: "Programming 2", type: "Seminar" },
    { day: "TUESDAY", startTime: "11:30", endTime: "12:50", subject: "Calculus 2", type: "Seminar" },
    { day: "THURSDAY", startTime: "15:00", endTime: "16:20", subject: "Physics 2", type: "Seminar", teacher: "Ulasheva Z. A." },
    { day: "FRIDAY", startTime: "15:00", endTime: "16:20", subject: "Calculus 2", type: "Seminar", teacher: "Husanov A. Z." },
    { day: "SATURDAY", startTime: "15:00", endTime: "16:20", subject: "Religious Studies", type: "Seminar", teacher: "Aytbayev M. Y." },
    { day: "THURSDAY", startTime: "16:30", endTime: "17:50", subject: "Data Structures and Algorithms", type: "Seminar", teacher: "Nematova Z. F." },
    { day: "FRIDAY", startTime: "16:30", endTime: "17:50", subject: "Philosophy", type: "Seminar", teacher: "Kadirova Z. R." },
    { day: "SATURDAY", startTime: "16:30", endTime: "17:50", subject: "Programming 2", type: "Seminar", teacher: "Boborayimov O. X." },
    { day: "SATURDAY", startTime: "18:00", endTime: "19:20", subject: "Foreign Language 2", type: "Seminar", teacher: "Xudayberdiyeva D. I." },
];