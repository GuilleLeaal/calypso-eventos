export type ReservationBlock = {
  id: string;
  event_date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "approved" | "rejected" | "expired";
  created_at: string;
};

export type ReservationSlot = {
  label: string;
  startTime: string;
  endTime: string;
  period: "day" | "night";
};

const WEEKDAY_NIGHT_SLOTS: ReservationSlot[] = [
  { label: "17:00 a 20:00", startTime: "17:00", endTime: "20:00", period: "night" },
  { label: "17:30 a 20:30", startTime: "17:30", endTime: "20:30", period: "night" },
  { label: "18:00 a 21:00", startTime: "18:00", endTime: "21:00", period: "night" },
  { label: "18:30 a 21:30", startTime: "18:30", endTime: "21:30", period: "night" },
  { label: "19:00 a 22:00", startTime: "19:00", endTime: "22:00", period: "night" },
  { label: "19:30 a 22:30", startTime: "19:30", endTime: "22:30", period: "night" },
  { label: "20:00 a 23:00", startTime: "20:00", endTime: "23:00", period: "night" },
];

const WEEKEND_DAY_SLOTS: ReservationSlot[] = [
  { label: "11:00 a 14:00", startTime: "11:00", endTime: "14:00", period: "day" },
  { label: "11:30 a 14:30", startTime: "11:30", endTime: "14:30", period: "day" },
  { label: "12:00 a 15:00", startTime: "12:00", endTime: "15:00", period: "day" },
  { label: "12:30 a 15:30", startTime: "12:30", endTime: "15:30", period: "day" },
  { label: "13:00 a 16:00", startTime: "13:00", endTime: "16:00", period: "day" },
  { label: "13:30 a 16:30", startTime: "13:30", endTime: "16:30", period: "day" },
  { label: "14:00 a 17:00", startTime: "14:00", endTime: "17:00", period: "day" },
];

const WEEKEND_NIGHT_SLOTS: ReservationSlot[] = WEEKDAY_NIGHT_SLOTS;

export function isWeekend(dateValue: string) {
  const date = createLocalDate(dateValue);
  const day = date.getDay();

  return day === 0 || day === 6;
}

export function getSlotsForDate(dateValue: string): ReservationSlot[] {
  if (!dateValue) return [];

  if (isWeekend(dateValue)) {
    return [...WEEKEND_DAY_SLOTS, ...WEEKEND_NIGHT_SLOTS];
  }

  return WEEKDAY_NIGHT_SLOTS;
}

export function getAvailableSlots(
  dateValue: string,
  blocks: ReservationBlock[]
): ReservationSlot[] {
  const slots = getSlotsForDate(dateValue);

  return slots.filter((slot) => {
    return !blocks.some((block) => hasSlotConflict(dateValue, slot, block));
  });
}

export function hasSlotConflict(
  dateValue: string,
  slot: ReservationSlot,
  block: ReservationBlock
) {
  const bufferMinutes = 90;

  const newStart = toMinutes(slot.startTime);
  const newEnd = toMinutes(slot.endTime);
  const existingStart = toMinutes(normalizeTime(block.start_time));
  const existingEnd = toMinutes(normalizeTime(block.end_time));

  return newStart < existingEnd + bufferMinutes && newEnd + bufferMinutes > existingStart;
}

export function formatDateForDisplay(dateValue: string) {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(createLocalDate(dateValue));
}

export function getTodayInputValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function normalizeTime(value: string) {
  return value.slice(0, 5);
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function createLocalDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);

  return new Date(year, month - 1, day);
}