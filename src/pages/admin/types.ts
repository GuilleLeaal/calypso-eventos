export type ReservationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "completed";

export type AdminSection =
  | "reservations"
  | "calendar"
  | "completed_events"
  | "disabled_dates"
  | "reviews";

export type ReservationSource = "website" | "admin";

export type Reservation = {
  id: string;
  customer_name: string;
  event_type: string;
  phone: string;
  email: string | null;
  children_count: number | null;
  adults_count: number | null;
  event_date: string;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  deposit_paid: boolean;
  notes: string | null;
  source: ReservationSource;
  discovery_source: string | null;
  agreed_price: number | null;
  settlement_amount: number | null;
  deposit_amount: number | null;
  staff_count: number | null; // Legacy: reservas anteriores al desglose de personal.
  waiters_count: number | null;
  animators_count: number | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  name: string | null;
  message: string;
  rating: number;
  approved: boolean;
  created_at: string;
};

export type DisabledReservationDateRange = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
};

export type ManualReservationFormValues = {
  customer_name: string;
  event_type: string;
  phone: string;
  email: string;
  children_count: string;
  adults_count: string;
  event_date: string;
  start_time: string;
  end_time: string;
  notes: string;
  deposit_paid: boolean;
  agreed_price: string;
  deposit_amount: string;
  waiters_count: string;
  animators_count: string;
  discovery_source: string;
};

export type ReservationUpdateValues = Partial<
  Pick<
    Reservation,
    | "customer_name"
    | "event_type"
    | "phone"
    | "email"
    | "children_count"
    | "adults_count"
    | "event_date"
    | "start_time"
    | "end_time"
    | "status"
    | "deposit_paid"
    | "agreed_price"
    | "settlement_amount"
    | "deposit_amount"
    | "staff_count"
    | "waiters_count"
    | "animators_count"
    | "notes"
    | "discovery_source"
  >
>;

export type ReservationDetailsUpdateValues = Pick<
  Reservation,
  | "customer_name"
  | "event_type"
  | "phone"
  | "email"
  | "children_count"
  | "adults_count"
  | "event_date"
  | "start_time"
  | "end_time"
  | "status"
  | "deposit_paid"
  | "agreed_price"
  | "settlement_amount"
  | "deposit_amount"
  | "waiters_count"
  | "animators_count"
  | "discovery_source"
> & {
  staff_count?: number | null;
};
