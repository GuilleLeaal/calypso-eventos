import {
  createLocalDate,
  formatDateForDisplay,
  getTodayInputValue,
} from "../../../lib/reservations";
import { FIRST_RESERVATION_DATE } from "../constants";
import type { DisabledReservationDateRange } from "../types";

export { createLocalDate };

export function getMinReservationDate() {
  const today = getTodayInputValue();
  return today > FIRST_RESERVATION_DATE ? today : FIRST_RESERVATION_DATE;
}

export function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getCalendarDays(monthDate: Date) {
  const start = getMonthStart(monthDate);
  const end = getMonthEnd(monthDate);

  const days: Date[] = [];

  const firstCalendarDay = new Date(start);
  firstCalendarDay.setDate(start.getDate() - start.getDay());

  const lastCalendarDay = new Date(end);
  lastCalendarDay.setDate(end.getDate() + (6 - end.getDay()));

  const current = new Date(firstCalendarDay);

  while (current <= lastCalendarDay) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-UY", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getDisabledRangeForDate(
  dateValue: string,
  disabledRanges: DisabledReservationDateRange[],
) {
  return disabledRanges.find(
    (range) => dateValue >= range.start_date && dateValue <= range.end_date,
  );
}

export function isDateInDisabledRange(
  dateValue: string,
  disabledRanges: DisabledReservationDateRange[],
) {
  return Boolean(getDisabledRangeForDate(dateValue, disabledRanges));
}

export function getDisabledRangeLabel(range: DisabledReservationDateRange) {
  if (range.start_date === range.end_date) {
    return formatDateForDisplay(range.start_date);
  }

  return `${formatDateForDisplay(range.start_date)} al ${formatDateForDisplay(
    range.end_date,
  )}`;
}
