import type { Reservation } from "../types";
import { getReservationBalance } from "./exportHelpers";

export function getMonthlySummary(reservations: Reservation[]) {
  const events = reservations.filter((item) => item.status === "approved" || item.status === "completed");
  const cents = (value: number) => Math.round(value * 100);
  return {
    events,
    pendingRequests: reservations.filter((item) => item.status === "pending").length,
    completed: events.filter((item) => item.status === "completed").length,
    missingPrices: events.filter((item) => item.agreed_price === null).length,
    agreed: events.reduce((sum, item) => sum + cents(Number(item.agreed_price ?? 0)), 0) / 100,
    paid: events.reduce((sum, item) => sum + cents(getReservationBalance(item).paid), 0) / 100,
    pending: events.reduce((sum, item) => sum + cents(getReservationBalance(item).pending ?? 0), 0) / 100,
    credit: events.reduce((sum, item) => sum + cents(getReservationBalance(item).credit), 0) / 100,
  };
}
