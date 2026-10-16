import { normalizeTime } from "../../../lib/reservations";
import { TIME_24H_REGEX } from "../constants";

export { normalizeTime };

export function isValid24HourTime(value: string) {
  return TIME_24H_REGEX.test(normalizeTime(value));
}

export function timeToMinutes(value: string) {
  const [hours, minutes] = normalizeTime(value).split(":").map(Number);

  return hours * 60 + minutes;
}

export function isOvernightTimeRange(startTime: string, endTime: string) {
  const start = normalizeTime(startTime);
  const end = normalizeTime(endTime);

  if (!isValid24HourTime(start) || !isValid24HourTime(end)) {
    return false;
  }

  return timeToMinutes(end) < timeToMinutes(start);
}

export function formatReservationTimeRange(startTime: string, endTime: string) {
  const start = normalizeTime(startTime);
  const end = normalizeTime(endTime);
  const nextDayLabel = isOvernightTimeRange(start, end)
    ? " (día siguiente)"
    : "";

  return `${start} a ${end}${nextDayLabel}`;
}
