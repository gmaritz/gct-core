"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE = void 0;
exports.parseCalendarDate = parseCalendarDate;
exports.calendarDateInTimeZone = calendarDateInTimeZone;
exports.subtractCalendarDays = subtractCalendarDays;
exports.SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE = "Africa/Johannesburg";
function parseCalendarDate(value, label) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error(`${label} must be a valid YYYY-MM-DD calendar date.`);
    }
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
        throw new Error(`${label} must be a valid YYYY-MM-DD calendar date.`);
    }
    return value;
}
function calendarDateInTimeZone(value, timeZone, label) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new Error(`${label} must be a valid date.`);
    }
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(value);
    const part = (type) => parts.find((item) => item.type === type)?.value;
    const year = part("year");
    const month = part("month");
    const day = part("day");
    if (!year || !month || !day)
        throw new Error(`${label} could not be resolved in ${timeZone}.`);
    return `${year.padStart(4, "0")}-${month}-${day}`;
}
function subtractCalendarDays(value, days) {
    const date = new Date(`${parseCalendarDate(value, "Calendar date")}T00:00:00.000Z`);
    if (!Number.isInteger(days) || days < 0)
        throw new Error("Calendar days must be a non-negative integer.");
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString().slice(0, 10);
}
//# sourceMappingURL=calendar-date.js.map