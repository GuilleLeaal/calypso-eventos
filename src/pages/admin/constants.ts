import type { ReservationStatus } from "./types";

export const FIRST_RESERVATION_DATE = "2026-07-01";
export const MAX_CHILDREN_COUNT = 30;
export const MAX_ADULTS_COUNT = 50;
export const RESERVATIONS_PER_PAGE = 4;
export const EXPORT_BATCH_SIZE = 500;

export const RESERVATION_EXPORT_COLUMNS =
  "id, customer_name, event_type, phone, email, children_count, adults_count, event_date, start_time, end_time, status, deposit_paid, notes, source, discovery_source, agreed_price, settlement_amount, deposit_amount, staff_count, waiters_count, animators_count, created_at, updated_at";

export const statusLabels: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  expired: "Vencida",
  completed: "Finalizada",
};

export const statusClasses: Record<ReservationStatus, string> = {
  pending: "bg-[#e8c17f]/18 text-[#8a5b1f] border-[#e8c17f]/45",
  approved: "bg-[#0BB3A6]/12 text-[#087d75] border-[#0BB3A6]/35",
  rejected: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-stone-100 text-stone-600 border-stone-200",
  completed: "bg-[#2f241e]/8 text-[#2f241e] border-[#2f241e]/15",
};

export const EVENT_TYPES = [
  "Cumpleaños infantil",
  "Cumpleaños familiar",
  "Reunión familiar",
  "Evento corporativo",
  "Bautismo",
  "Aniversario",
  "Evento especial",
  "Otro",
];

export const DISCOVERY_OPTIONS = [
  "Instagram",
  "Facebook",
  "Google",
  "Ya hice un evento antes",
  "Fui a un evento en Calypso",
  "Alguien me contó sobre Calypso",
  "Pasé por el lugar",
  "Otro",
];

export const TIME_24H_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
