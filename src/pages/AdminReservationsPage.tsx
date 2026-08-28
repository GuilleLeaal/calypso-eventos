import { useEffect, useMemo, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { motion, circOut } from "framer-motion";
import {
  ArrowLeft,
  CalendarOff,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  formatDateForDisplay,
  getAvailableSlots,
  getSlotsForDate,
  getTodayInputValue,
  type ReservationBlock,
  type ReservationSlot,
} from "../lib/reservations";

type ReservationStatus =
  "pending" | "approved" | "rejected" | "expired" | "completed";

type AdminSection = "reservations" | "disabled_dates" | "reviews";

type ReservationSource = "website" | "admin";

type Reservation = {
  id: string;
  customer_name: string;
  event_type: string;
  phone: string;
  email: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  deposit_paid: boolean;
  notes: string | null;
  source: ReservationSource;
  discovery_source: string | null;
  created_at: string;
  updated_at: string;
};

type Review = {
  id: string;
  name: string | null;
  message: string;
  rating: number;
  approved: boolean;
  created_at: string;
};

type DisabledReservationDateRange = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
};

type ReservationUpdateValues = Partial<
  Pick<
    Reservation,
    | "customer_name"
    | "event_type"
    | "phone"
    | "email"
    | "event_date"
    | "start_time"
    | "end_time"
    | "status"
    | "deposit_paid"
    | "notes"
    | "discovery_source"
  >
>;

const FIRST_RESERVATION_DATE = "2026-07-01";

function getMinReservationDate() {
  const today = getTodayInputValue();
  return today > FIRST_RESERVATION_DATE ? today : FIRST_RESERVATION_DATE;
}

const statusLabels: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  expired: "Vencida",
  completed: "Finalizada",
};

const statusClasses: Record<ReservationStatus, string> = {
  pending: "bg-[#e8c17f]/18 text-[#8a5b1f] border-[#e8c17f]/45",
  approved: "bg-[#0BB3A6]/12 text-[#087d75] border-[#0BB3A6]/35",
  rejected: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-stone-100 text-stone-600 border-stone-200",
  completed: "bg-[#2f241e]/8 text-[#2f241e] border-[#2f241e]/15",
};

const EVENT_TYPES = [
  "Cumpleaños infantil",
  "Cumpleaños familiar",
  "Reunión familiar",
  "Evento corporativo",
  "Bautismo",
  "Aniversario",
  "Evento especial",
  "Otro",
];

const DISCOVERY_OPTIONS = [
  "Instagram",
  "Facebook",
  "Google",
  "Ya hice un evento antes",
  "Fui a un evento en Calypso",
  "Alguien me contó sobre Calypso",
  "Pasé por el lugar",
  "Otro",
];

function normalizeTime(value: string) {
  return value.trim().slice(0, 5);
}

const TIME_24H_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValid24HourTime(value: string) {
  return TIME_24H_REGEX.test(normalizeTime(value));
}

function timeToMinutes(value: string) {
  const [hours, minutes] = normalizeTime(value).split(":").map(Number);

  return hours * 60 + minutes;
}

function escapeCsvValue(value: unknown) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function createLocalDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getCalendarDays(monthDate: Date) {
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

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-UY", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function isDateInDisabledRange(
  dateValue: string,
  disabledRanges: DisabledReservationDateRange[],
) {
  return disabledRanges.some(
    (range) => dateValue >= range.start_date && dateValue <= range.end_date,
  );
}

function getDisabledRangeLabel(range: DisabledReservationDateRange) {
  if (range.start_date === range.end_date) {
    return formatDateForDisplay(range.start_date);
  }

  return `${formatDateForDisplay(range.start_date)} al ${formatDateForDisplay(
    range.end_date,
  )}`;
}

export default function AdminReservationsPage() {
  const [sessionReady, setSessionReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState("");

  const [filter, setFilter] = useState<"all" | ReservationStatus>("all");
  const [activeSection, setActiveSection] =
    useState<AdminSection>("reservations");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewActionLoadingId, setReviewActionLoadingId] = useState<
    string | null
  >(null);
  const [reviewFilter, setReviewFilter] = useState<
    "all" | "pending" | "approved"
  >("all");

  const [disabledRanges, setDisabledRanges] = useState<
    DisabledReservationDateRange[]
  >([]);
  const [loadingDisabledRanges, setLoadingDisabledRanges] = useState(false);
  const [disabledActionLoadingId, setDisabledActionLoadingId] = useState<
    string | null
  >(null);

  const [disabledForm, setDisabledForm] = useState({
    start_date: getMinReservationDate(),
    end_date: getMinReservationDate(),
    reason: "",
  });

  const [manualBlocks, setManualBlocks] = useState<ReservationBlock[]>([]);
  const [manualMonthBlocks, setManualMonthBlocks] = useState<
    ReservationBlock[]
  >([]);
  const [loadingManualSlots, setLoadingManualSlots] = useState(false);
  const [loadingManualMonthBlocks, setLoadingManualMonthBlocks] =
    useState(false);

  const [manualCalendarMonth, setManualCalendarMonth] = useState(() =>
    createLocalDate(getMinReservationDate()),
  );

  const [manualForm, setManualForm] = useState({
    customer_name: "",
    event_type: "",
    phone: "",
    email: "",
    event_date: getMinReservationDate(),
    start_time: "17:00",
    end_time: "20:00",
    notes: "",
    deposit_paid: false,
    discovery_source: "",
  });

  const manualSlots = useMemo(() => {
    if (isDateInDisabledRange(manualForm.event_date, disabledRanges)) {
      return [];
    }

    return getAvailableSlots(manualForm.event_date, manualBlocks);
  }, [manualForm.event_date, manualBlocks, disabledRanges]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting admin session:", error);
        }

        if (!mounted) return;

        const hasSession = Boolean(data.session);

        setIsLoggedIn(hasSession);
        setSessionReady(true);

        if (hasSession) {
          fetchReservations();
          fetchReviews();
          fetchDisabledRanges();
        }
      } catch (error) {
        console.error("Unexpected admin session error:", error);

        if (mounted) {
          setIsLoggedIn(false);
          setSessionReady(true);
        }
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = Boolean(session);

      setIsLoggedIn(hasSession);

      if (hasSession) {
        fetchReservations();
        fetchReviews();
        fetchDisabledRanges();
      } else {
        setReservations([]);
        setReviews([]);
        setDisabledRanges([]);
        setManualBlocks([]);
        setManualMonthBlocks([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchManualBlocks();
  }, [manualForm.event_date, isLoggedIn]);

  useEffect(() => {
    fetchManualMonthBlocks();
  }, [manualCalendarMonth, isLoggedIn]);

  const filteredReservations = useMemo(() => {
    if (filter === "all") return reservations;

    return reservations.filter((reservation) => reservation.status === filter);
  }, [reservations, filter]);

  async function fetchDisabledRanges() {
    if (!isLoggedIn) return;

    setLoadingDisabledRanges(true);

    try {
      const { data, error } = await supabase
        .from("disabled_reservation_dates")
        .select("id, start_date, end_date, reason, created_at")
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Error fetching disabled reservation dates:", error);
        setGlobalError("No pudimos cargar las fechas inhabilitadas.");
        setDisabledRanges([]);
        return;
      }

      setDisabledRanges((data || []) as DisabledReservationDateRange[]);
    } catch (error) {
      console.error("Unexpected disabled dates error:", error);
      setGlobalError("Ocurrió un error cargando las fechas inhabilitadas.");
      setDisabledRanges([]);
    } finally {
      setLoadingDisabledRanges(false);
    }
  }

  async function handleCreateDisabledRange(event: FormEvent) {
    event.preventDefault();

    setGlobalError("");

    if (!disabledForm.start_date || !disabledForm.end_date) {
      setGlobalError("Seleccioná fecha de inicio y fecha de fin.");
      return;
    }

    if (disabledForm.start_date < getMinReservationDate()) {
      setGlobalError("No se pueden inhabilitar fechas anteriores a la fecha mínima.");
      return;
    }

    if (disabledForm.end_date < disabledForm.start_date) {
      setGlobalError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    const reservationsInRange = reservations.filter(
      (reservation) =>
        reservation.event_date >= disabledForm.start_date &&
        reservation.event_date <= disabledForm.end_date &&
        reservation.status !== "rejected",
    );

    if (reservationsInRange.length > 0) {
      const reservationSummary = reservationsInRange
        .slice(0, 8)
        .map(
          (reservation) =>
            `• ${formatDateForDisplay(reservation.event_date)} - ${normalizeTime(
              reservation.start_time,
            )} a ${normalizeTime(reservation.end_time)} - ${
              reservation.customer_name
            } (${statusLabels[reservation.status]})`,
        )
        .join("\n");

      const extraCount =
        reservationsInRange.length > 8
          ? `\n...y ${reservationsInRange.length - 8} reserva(s) más.`
          : "";

      const confirmed = window.confirm(
        `Atención: ya existen ${reservationsInRange.length} reserva(s) en el rango que querés inhabilitar.\n\n${reservationSummary}${extraCount}\n\nLa fecha se inhabilitará para nuevas reservas, pero estas reservas existentes NO se borran ni se modifican automáticamente. Revisalas manualmente si corresponde.\n\n¿Querés continuar?`,
      );

      if (!confirmed) return;
    }

    setDisabledActionLoadingId("new");

    const { error } = await supabase.from("disabled_reservation_dates").insert({
      start_date: disabledForm.start_date,
      end_date: disabledForm.end_date,
      reason: disabledForm.reason.trim() || null,
    });

    if (error) {
      console.error("Error creating disabled reservation date:", error);
      setGlobalError(
        error.message || "No pudimos inhabilitar la fecha seleccionada.",
      );
      setDisabledActionLoadingId(null);
      return;
    }

    setDisabledForm({
      start_date: getMinReservationDate(),
      end_date: getMinReservationDate(),
      reason: "",
    });

    setManualForm((prev) => {
      const nextDate =
        prev.event_date >= disabledForm.start_date &&
        prev.event_date <= disabledForm.end_date
          ? getMinReservationDate()
          : prev.event_date;

      return {
        ...prev,
        event_date: nextDate,
      };
    });

    await fetchDisabledRanges();
    await fetchManualBlocks();
    await fetchManualMonthBlocks();

    setDisabledActionLoadingId(null);
  }

  async function deleteDisabledRange(id: string) {
    const confirmed = window.confirm(
      "¿Seguro que querés habilitar nuevamente esta fecha o rango?",
    );

    if (!confirmed) return;

    setDisabledActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase
      .from("disabled_reservation_dates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting disabled reservation date:", error);
      setGlobalError("No pudimos habilitar nuevamente la fecha.");
    } else {
      await fetchDisabledRanges();
      await fetchManualBlocks();
      await fetchManualMonthBlocks();
    }

    setDisabledActionLoadingId(null);
  }

  async function fetchManualBlocks() {
    if (!manualForm.event_date || !isLoggedIn) return;

    setLoadingManualSlots(true);

    try {
      const { data, error } = await supabase.rpc(
        "get_public_reservation_blocks",
        {
          target_date: manualForm.event_date,
        },
      );

      if (error) {
        console.error("Error fetching manual reservation blocks:", error);
        setManualBlocks([]);
        return;
      }

      setManualBlocks((data || []) as ReservationBlock[]);
    } catch (error) {
      console.error("Unexpected manual blocks error:", error);
      setManualBlocks([]);
    } finally {
      setLoadingManualSlots(false);
    }
  }

  async function fetchManualMonthBlocks() {
    if (!isLoggedIn) return;

    const start = toInputDate(getMonthStart(manualCalendarMonth));
    const end = toInputDate(getMonthEnd(manualCalendarMonth));

    setLoadingManualMonthBlocks(true);

    try {
      const { data, error } = await supabase.rpc(
        "get_public_reservation_blocks_range",
        {
          start_date: start,
          end_date: end,
        },
      );

      if (error) {
        console.error("Error fetching manual month blocks:", error);
        setManualMonthBlocks([]);
        return;
      }

      setManualMonthBlocks((data || []) as ReservationBlock[]);
    } catch (error) {
      console.error("Unexpected manual month blocks error:", error);
      setManualMonthBlocks([]);
    } finally {
      setLoadingManualMonthBlocks(false);
    }
  }

  async function fetchReservations() {
    setLoadingReservations(true);
    setGlobalError("");

    try {
      const { error: expiredError } = await supabase.rpc(
        "mark_expired_reservations",
      );

      if (expiredError) {
        console.error("Error marking expired reservations:", expiredError);
      }

      const { error: completeError } = await supabase.rpc(
        "mark_completed_reservations",
      );

      if (completeError) {
        console.error("Error marking completed reservations:", completeError);
      }

      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching reservations:", error);
        setGlobalError(
          "No pudimos cargar las reservas. Revisá permisos de Supabase.",
        );
        setReservations([]);
        return;
      }

      setReservations((data || []) as Reservation[]);
    } catch (error) {
      console.error("Unexpected fetch reservations error:", error);
      setGlobalError("Ocurrió un error cargando las reservas.");
      setReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  }

  async function fetchReviews() {
    setLoadingReviews(true);
    setGlobalError("");

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, name, message, rating, approved, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        setGlobalError("No pudimos cargar las reseñas.");
        setReviews([]);
        return;
      }

      setReviews((data || []) as Review[]);
    } catch (error) {
      console.error("Unexpected reviews error:", error);
      setGlobalError("Ocurrió un error cargando las reseñas.");
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }

  async function updateReviewStatus(id: string, approved: boolean) {
    setReviewActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase
      .from("reviews")
      .update({ approved })
      .eq("id", id);

    if (error) {
      console.error("Error updating review:", error);
      setGlobalError("No pudimos actualizar la reseña.");
    } else {
      await fetchReviews();
    }

    setReviewActionLoadingId(null);
  }

  async function deleteReview(id: string) {
    const confirmed = window.confirm(
      "¿Seguro que querés borrar esta reseña? Esta acción no se puede deshacer.",
    );

    if (!confirmed) return;

    setReviewActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      console.error("Error deleting review:", error);
      setGlobalError("No pudimos borrar la reseña.");
    } else {
      await fetchReviews();
    }

    setReviewActionLoadingId(null);
  }

  async function refreshAll() {
    await fetchReservations();
    await fetchReviews();
    await fetchDisabledRanges();
    await fetchManualBlocks();
    await fetchManualMonthBlocks();
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    setLoginError("");
    setLoginLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });

    setLoginLoading(false);

    if (error) {
      setLoginError("Email o contraseña incorrectos.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function updateReservation(
    id: string,
    values: ReservationUpdateValues,
  ) {
    setActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase
      .from("reservations")
      .update({
        ...values,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating reservation:", error);
      setGlobalError("No pudimos actualizar la reserva.");
      setActionLoadingId(null);
      return false;
    }

    await refreshAll();
    setActionLoadingId(null);
    return true;
  }

  async function deleteReservation(id: string) {
    const confirmed = window.confirm(
      "¿Seguro que querés borrar esta reserva? Esta acción no se puede deshacer.",
    );

    if (!confirmed) return;

    setActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase.from("reservations").delete().eq("id", id);

    if (error) {
      console.error("Error deleting reservation:", error);
      setGlobalError("No pudimos borrar la reserva.");
    } else {
      await refreshAll();
    }

    setActionLoadingId(null);
  }

  async function handleCreateManualReservation(event: FormEvent) {
    event.preventDefault();

    setGlobalError("");

    if (!manualForm.customer_name.trim()) {
      setGlobalError("Ingresá el nombre del cliente.");
      return;
    }

    if (!manualForm.event_type.trim()) {
      setGlobalError("Seleccioná el tipo de evento.");
      return;
    }

    if (!manualForm.phone.trim()) {
      setGlobalError("Ingresá el teléfono.");
      return;
    }

    if (isDateInDisabledRange(manualForm.event_date, disabledRanges)) {
      setGlobalError(
        "Esta fecha está inhabilitada. Habilitala primero para crear una reserva.",
      );
      return;
    }

    const startTime = normalizeTime(manualForm.start_time);
    const endTime = normalizeTime(manualForm.end_time);

    if (!isValid24HourTime(startTime) || !isValid24HourTime(endTime)) {
      setGlobalError(
        "Ingresá inicio y fin en formato 24 horas. Ejemplo: 17:00.",
      );
      return;
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      setGlobalError(
        "El horario de inicio debe ser anterior al horario de fin.",
      );
      return;
    }

    const { error } = await supabase.rpc("create_admin_reservation", {
      p_customer_name: manualForm.customer_name.trim(),
      p_event_type: manualForm.event_type,
      p_phone: manualForm.phone.trim(),
      p_email: manualForm.email.trim(),
      p_event_date: manualForm.event_date,
      p_start_time: startTime,
      p_end_time: endTime,
      p_deposit_paid: manualForm.deposit_paid,
      p_notes: manualForm.notes.trim(),
      p_discovery_source: manualForm.discovery_source,
    });

    if (error) {
      console.error("Error creating manual reservation:", error);
      setGlobalError(
        error.message ||
          "No pudimos crear la reserva manual. Revisá los datos ingresados.",
      );
      return;
    }

    setManualForm({
      customer_name: "",
      event_type: "",
      phone: "",
      email: "",
      event_date: getMinReservationDate(),
      start_time: "17:00",
      end_time: "20:00",
      notes: "",
      deposit_paid: false,
      discovery_source: "",
    });

    setManualCalendarMonth(createLocalDate(getMinReservationDate()));

    await refreshAll();
  }

  function applyManualSlot(slot: ReservationSlot) {
    setManualForm((prev) => ({
      ...prev,
      start_time: slot.startTime,
      end_time: slot.endTime,
    }));
  }

  async function downloadApprovedAndCompletedCsv() {
    setGlobalError("");

    try {
      const { error: completeError } = await supabase.rpc(
        "mark_completed_reservations",
      );

      if (completeError) {
        console.error("Error marking completed before export:", completeError);
      }

      const { data, error } = await supabase
        .from("reservations")
        .select(
          "id, customer_name, event_type, phone, email, event_date, start_time, end_time, status, deposit_paid, notes, source, discovery_source, created_at, updated_at",
        )
        .in("status", ["approved", "completed"])
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error exporting reservations:", error);
        setGlobalError("No pudimos generar el archivo de reservas.");
        return;
      }

      const rows = (data || []) as Reservation[];

      if (rows.length === 0) {
        setGlobalError(
          "No hay reservas aprobadas o finalizadas para exportar todavía.",
        );
        return;
      }

      const headers = [
        "Estado",
        "Cliente",
        "Evento",
        "Fecha",
        "Inicio",
        "Fin",
        "Telefono",
        "Email",
        "Como conocio Calypso",
        "Pago sena",
        "Origen",
        "Notas",
        "Creada",
      ];

      const csvRows = rows.map((reservation) => [
        statusLabels[reservation.status],
        reservation.customer_name,
        reservation.event_type,
        reservation.event_date,
        normalizeTime(reservation.start_time),
        normalizeTime(reservation.end_time),
        reservation.phone,
        reservation.email || "",
        reservation.discovery_source || "",
        reservation.deposit_paid ? "Si" : "No",
        reservation.source === "website" ? "Web" : "Admin",
        reservation.notes || "",
        new Date(reservation.created_at).toLocaleString("es-UY"),
      ]);

      const csvContent = [
        "sep=;",
        headers.map(escapeCsvValue).join(";"),
        ...csvRows.map((row) => row.map(escapeCsvValue).join(";")),
      ].join("\r\n");

      const blob = new Blob([`\uFEFF${csvContent}`], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `reservas-calypso-${getTodayInputValue()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      await fetchReservations();
    } catch (error) {
      console.error("Unexpected export error:", error);
      setGlobalError("Ocurrió un error generando el archivo.");
    }
  }

  if (!sessionReady) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-[#f6f0e7] pt-28">
        <Loader2 className="h-8 w-8 animate-spin text-[#0BB3A6]" />
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="relative min-h-[100svh] overflow-hidden bg-[#f6f0e7] pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-130px] top-[-120px] h-80 w-80 rounded-full bg-[#0BB3A6]/12 blur-3xl" />
          <div className="absolute right-[-140px] bottom-[-130px] h-96 w-96 rounded-full bg-[#e8c17f]/14 blur-3xl" />
        </div>

        <section className="relative mx-auto max-w-md px-6 pb-24">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#087d75] transition hover:text-[#0BB3A6]"
          >
            <ArrowLeft size={17} />
            Volver al sitio
          </Link>

          <motion.form
            onSubmit={handleLogin}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: circOut }}
            className="mt-8 rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-7 shadow-[0_22px_60px_rgba(90,64,50,0.12)] backdrop-blur"
          >
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#0BB3A6]/12 text-[#0BB3A6]">
              <Lock size={25} />
            </div>

            <h1 className="mt-5 font-display text-4xl text-[#2f241e]">
              Admin Calypso
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-[#5c473b]">
              Acceso privado para gestionar solicitudes y reservas.
            </p>

            <div className="mt-7 space-y-5">
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                  Email
                </span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  className="input-contact"
                  placeholder="admin@calypso.com"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                  Contraseña
                </span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  className="input-contact"
                  placeholder="••••••••"
                />
              </label>
            </div>

            {loginError && (
              <p className="mt-5 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0BB3A6] px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_42px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShieldCheck size={18} />
              )}
              Entrar
            </button>
          </motion.form>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#f6f0e7] pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-130px] top-[-120px] h-80 w-80 rounded-full bg-[#0BB3A6]/12 blur-3xl" />
        <div className="absolute right-[-140px] bottom-[-130px] h-96 w-96 rounded-full bg-[#e8c17f]/14 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#087d75] transition hover:text-[#0BB3A6]"
            >
              <ArrowLeft size={17} />
              Volver al sitio
            </Link>

            <h1 className="mt-6 font-display text-4xl leading-tight text-[#2f241e] md:text-6xl">
              Panel de{" "}
              <span className="relative inline-block text-[#0BB3A6]">
                administración
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#0BB3A6] via-[#e8c17f] to-transparent" />
              </span>
              .
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5c473b] md:text-base">
              Administrá reservas, reseñas, señas, notas internas y métricas de
              origen de clientes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadApprovedAndCompletedCsv}
              className="inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/55 px-5 py-3 text-sm font-semibold text-[#2f241e] transition hover:bg-white"
            >
              <Download size={16} />
              Descargar Excel
            </button>

            <button
              onClick={refreshAll}
              className="inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/55 px-5 py-3 text-sm font-semibold text-[#2f241e] transition hover:bg-white"
            >
              <RefreshCw size={16} />
              Actualizar
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-[#2f241e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d1511]"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveSection("reservations")}
            className={[
              "rounded-full border px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] transition",
              activeSection === "reservations"
                ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
                : "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:bg-white",
            ].join(" ")}
          >
            Reservas
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("disabled_dates")}
            className={[
              "rounded-full border px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] transition",
              activeSection === "disabled_dates"
                ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
                : "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:bg-white",
            ].join(" ")}
          >
            Fechas inhabilitadas
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("reviews")}
            className={[
              "rounded-full border px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] transition",
              activeSection === "reviews"
                ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
                : "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:bg-white",
            ].join(" ")}
          >
            Reseñas
          </button>
        </div>

        {globalError && (
          <p className="mt-7 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {globalError}
          </p>
        )}

        {activeSection === "reservations" && (
          <div className="mt-10 grid gap-7 xl:grid-cols-[0.72fr_1.28fr]">
            <section className="rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur">
              <div className="flex items-start justify-between gap-4 border-b border-[#e4cfad] pb-5">
                <div>
                  <h2 className="font-display text-3xl text-[#2f241e]">
                    Crear reserva
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
                    Para clientes que reservaron por fuera de la web.
                  </p>
                </div>

                <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/12 text-[#0BB3A6] sm:grid">
                  <Plus size={20} />
                </div>
              </div>

              <form onSubmit={handleCreateManualReservation} className="mt-6">
                <div className="grid gap-5">
                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Cliente
                    </span>
                    <input
                      value={manualForm.customer_name}
                      onChange={(event) =>
                        setManualForm((prev) => ({
                          ...prev,
                          customer_name: event.target.value,
                        }))
                      }
                      className="input-contact"
                      placeholder="Nombre y apellido"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Tipo de evento
                    </span>
                    <select
                      value={manualForm.event_type}
                      onChange={(event) =>
                        setManualForm((prev) => ({
                          ...prev,
                          event_type: event.target.value,
                        }))
                      }
                      className="input-contact"
                    >
                      <option value="">Seleccioná una opción</option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Cómo conoció Calypso
                    </span>

                    <select
                      value={manualForm.discovery_source}
                      onChange={(event) =>
                        setManualForm((prev) => ({
                          ...prev,
                          discovery_source: event.target.value,
                        }))
                      }
                      className="input-contact"
                    >
                      <option value="">No indicado</option>
                      {DISCOVERY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                        Teléfono
                      </span>
                      <input
                        value={manualForm.phone}
                        onChange={(event) =>
                          setManualForm((prev) => ({
                            ...prev,
                            phone: event.target.value,
                          }))
                        }
                        className="input-contact"
                        placeholder="+598..."
                      />
                    </label>

                    <label>
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                        Email
                      </span>
                      <input
                        value={manualForm.email}
                        onChange={(event) =>
                          setManualForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        className="input-contact"
                        placeholder="cliente@email.com"
                      />
                    </label>
                  </div>

                  <div>
                    <span className="mb-3 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Fecha
                    </span>

                    <ReservationCalendar
                      selectedDate={manualForm.event_date}
                      calendarMonth={manualCalendarMonth}
                      monthBlocks={manualMonthBlocks}
                      disabledRanges={disabledRanges}
                      loading={loadingManualMonthBlocks}
                      minDate={getMinReservationDate()}
                      onMonthChange={setManualCalendarMonth}
                      onSelectDate={(dateValue) => {
                        setManualForm((prev) => ({
                          ...prev,
                          event_date: dateValue,
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                        Horarios sugeridos
                      </span>

                      {loadingManualSlots && (
                        <span className="text-xs font-semibold text-[#087d75]">
                          Consultando...
                        </span>
                      )}
                    </div>

                    {manualSlots.length === 0 ? (
                      <div className="rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 text-sm leading-relaxed text-[#5c473b]">
                        No hay horarios sugeridos para esta fecha. Igual podés
                        ingresar un horario libre abajo.
                      </div>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {manualSlots.map((slot) => {
                          const active =
                            manualForm.start_time === slot.startTime &&
                            manualForm.end_time === slot.endTime;

                          return (
                            <button
                              key={`${slot.period}-${slot.startTime}`}
                              type="button"
                              onClick={() => applyManualSlot(slot)}
                              className={[
                                "rounded-[1rem] border px-3 py-2 text-left text-sm font-semibold transition",
                                active
                                  ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
                                  : "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:bg-white",
                              ].join(" ")}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <p className="mt-2 text-xs leading-relaxed text-[#6d5748]/75">
                      Son accesos rápidos. Para un caso especial, escribí un
                      horario libre en Inicio y Fin usando formato 24 horas.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                        Inicio
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-2][0-9]:[0-5][0-9]"
                        maxLength={5}
                        placeholder="17:00"
                        value={manualForm.start_time}
                        onChange={(event) =>
                          setManualForm((prev) => ({
                            ...prev,
                            start_time: event.target.value,
                          }))
                        }
                        className="input-contact"
                      />
                    </label>

                    <label>
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                        Fin
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-2][0-9]:[0-5][0-9]"
                        maxLength={5}
                        placeholder="20:00"
                        value={manualForm.end_time}
                        onChange={(event) =>
                          setManualForm((prev) => ({
                            ...prev,
                            end_time: event.target.value,
                          }))
                        }
                        className="input-contact"
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-3 rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 text-sm font-semibold text-[#2f241e]">
                    <input
                      type="checkbox"
                      checked={manualForm.deposit_paid}
                      onChange={(event) =>
                        setManualForm((prev) => ({
                          ...prev,
                          deposit_paid: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-[#0BB3A6]"
                    />
                    Pagó seña
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Notas internas
                    </span>
                    <textarea
                      value={manualForm.notes}
                      onChange={(event) =>
                        setManualForm((prev) => ({
                          ...prev,
                          notes: event.target.value,
                        }))
                      }
                      className="input-contact min-h-28 resize-none"
                      placeholder="Menú, personal requerido, condiciones especiales..."
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0BB3A6] px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_42px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94]"
                >
                  <Plus size={18} />
                  Crear reserva aprobada
                </button>
              </form>
            </section>

            <section className="rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur">
              <div className="flex flex-col gap-4 border-b border-[#e4cfad] pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-display text-3xl text-[#2f241e]">
                    Reservas
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
                    Pendientes, aprobadas, rechazadas, vencidas y finalizadas.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "all",
                      "pending",
                      "approved",
                      "rejected",
                      "expired",
                      "completed",
                    ] as const
                  ).map((item) => (
                    <button
                      key={item}
                      onClick={() => setFilter(item)}
                      className={[
                        "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition",
                        filter === item
                          ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
                          : "border-[#dfc8ab] bg-white/50 text-[#5c473b] hover:bg-white",
                      ].join(" ")}
                    >
                      {item === "all" ? "Todas" : statusLabels[item]}
                    </button>
                  ))}
                </div>
              </div>

              {loadingReservations ? (
                <div className="grid min-h-64 place-items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0BB3A6]" />
                </div>
              ) : filteredReservations.length === 0 ? (
                <div className="mt-6 rounded-[1.2rem] border border-[#dfc8ab] bg-white/45 p-6 text-sm text-[#5c473b]">
                  No hay reservas para este filtro.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {filteredReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      disabledRanges={disabledRanges}
                      loading={actionLoadingId === reservation.id}
                      onApprove={() =>
                        updateReservation(reservation.id, {
                          status: "approved",
                        })
                      }
                      onReject={() =>
                        updateReservation(reservation.id, {
                          status: "rejected",
                        })
                      }
                      onDepositChange={(value) =>
                        updateReservation(reservation.id, {
                          deposit_paid: value,
                        })
                      }
                      onSaveDetails={(values) =>
                        updateReservation(reservation.id, values)
                      }
                      onSaveNotes={(notes) =>
                        updateReservation(reservation.id, { notes })
                      }
                      onDelete={() => deleteReservation(reservation.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeSection === "disabled_dates" && (
          <DisabledDatesAdminSection
            disabledRanges={disabledRanges}
            loadingDisabledRanges={loadingDisabledRanges}
            actionLoadingId={disabledActionLoadingId}
            disabledForm={disabledForm}
            setDisabledForm={setDisabledForm}
            onCreate={handleCreateDisabledRange}
            onDelete={deleteDisabledRange}
          />
        )}

        {activeSection === "reviews" && (
          <ReviewsAdminSection
            reviews={reviews}
            loadingReviews={loadingReviews}
            reviewFilter={reviewFilter}
            setReviewFilter={setReviewFilter}
            reviewActionLoadingId={reviewActionLoadingId}
            onApprove={(id) => updateReviewStatus(id, true)}
            onHide={(id) => updateReviewStatus(id, false)}
            onDelete={deleteReview}
          />
        )}
      </section>
    </main>
  );
}

function DisabledDatesAdminSection({
  disabledRanges,
  loadingDisabledRanges,
  actionLoadingId,
  disabledForm,
  setDisabledForm,
  onCreate,
  onDelete,
}: {
  disabledRanges: DisabledReservationDateRange[];
  loadingDisabledRanges: boolean;
  actionLoadingId: string | null;
  disabledForm: {
    start_date: string;
    end_date: string;
    reason: string;
  };
  setDisabledForm: Dispatch<
    SetStateAction<{
      start_date: string;
      end_date: string;
      reason: string;
    }>
  >;
  onCreate: (event: FormEvent) => void;
  onDelete: (id: string) => void;
}) {
  const sortedRanges = [...disabledRanges].sort((a, b) =>
    a.start_date.localeCompare(b.start_date),
  );

  return (
    <div className="mt-10 grid gap-7 xl:grid-cols-[0.78fr_1.22fr]">
      <section className="rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur">
        <div className="flex items-start justify-between gap-4 border-b border-[#e4cfad] pb-5">
          <div>
            <h2 className="font-display text-3xl text-[#2f241e]">
              Inhabilitar fechas
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
              Marcá un día puntual o un rango para que no se puedan tomar
              nuevas reservas.
            </p>
          </div>

          <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-red-100 text-red-700 sm:grid">
            <CalendarOff size={20} />
          </div>
        </div>

        <form onSubmit={onCreate} className="mt-6 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Desde
              </span>
              <input
                type="date"
                min={getMinReservationDate()}
                value={disabledForm.start_date}
                onChange={(event) =>
                  setDisabledForm((prev) => ({
                    ...prev,
                    start_date: event.target.value,
                    end_date:
                      prev.end_date < event.target.value
                        ? event.target.value
                        : prev.end_date,
                  }))
                }
                className="input-contact"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Hasta
              </span>
              <input
                type="date"
                min={disabledForm.start_date || getMinReservationDate()}
                value={disabledForm.end_date}
                onChange={(event) =>
                  setDisabledForm((prev) => ({
                    ...prev,
                    end_date: event.target.value,
                  }))
                }
                className="input-contact"
              />
            </label>
          </div>

          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
              Motivo interno
            </span>
            <textarea
              value={disabledForm.reason}
              onChange={(event) =>
                setDisabledForm((prev) => ({
                  ...prev,
                  reason: event.target.value,
                }))
              }
              className="input-contact min-h-24 resize-none"
              placeholder="Ej: mantenimiento, evento privado, personal no disponible..."
            />
          </label>

          <button
            type="submit"
            disabled={actionLoadingId === "new"}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-red-700 px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_42px_rgba(185,28,28,0.18)] transition hover:-translate-y-0.5 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoadingId === "new" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CalendarOff size={18} />
            )}
            Inhabilitar fecha
          </button>

          <div className="rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 text-xs leading-relaxed text-[#6d5748]">
            Esto bloquea nuevas reservas para el público y también evita que se
            cree una reserva manual en esa fecha desde este panel. No borra
            reservas existentes.
          </div>
        </form>
      </section>

      <section className="rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur">
        <div className="flex flex-col gap-3 border-b border-[#e4cfad] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-[#2f241e]">
              Fechas bloqueadas
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
              Controlá rápidamente qué días no se ofrecerán para reservas.
            </p>
          </div>

          <span className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-700">
            {disabledRanges.length} activas
          </span>
        </div>

        {loadingDisabledRanges ? (
          <div className="grid min-h-64 place-items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0BB3A6]" />
          </div>
        ) : sortedRanges.length === 0 ? (
          <div className="mt-6 rounded-[1.2rem] border border-[#dfc8ab] bg-white/45 p-6 text-sm leading-relaxed text-[#5c473b]">
            No hay fechas inhabilitadas. El calendario queda disponible según
            reservas, separación horaria y reglas generales.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {sortedRanges.map((range) => (
              <article
                key={range.id}
                className="rounded-[1.35rem] border border-red-200 bg-red-50/70 p-5 shadow-[0_12px_32px_rgba(90,64,50,0.05)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-red-700">
                      <CalendarOff size={14} />
                      Inhabilitada
                    </span>

                    <h3 className="mt-3 font-display text-2xl text-[#2f241e]">
                      {getDisabledRangeLabel(range)}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
                      {range.reason || "Sin motivo indicado."}
                    </p>

                    <p className="mt-3 text-xs font-medium text-[#8a7667]">
                      Creada el {new Date(range.created_at).toLocaleString("es-UY")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDelete(range.id)}
                    disabled={actionLoadingId === range.id}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:opacity-60"
                  >
                    {actionLoadingId === range.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Check size={15} />
                    )}
                    Habilitar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ReviewsAdminSection({
  reviews,
  loadingReviews,
  reviewFilter,
  setReviewFilter,
  reviewActionLoadingId,
  onApprove,
  onHide,
  onDelete,
}: {
  reviews: Review[];
  loadingReviews: boolean;
  reviewFilter: "all" | "pending" | "approved";
  setReviewFilter: (filter: "all" | "pending" | "approved") => void;
  reviewActionLoadingId: string | null;
  onApprove: (id: string) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const filteredReviews = reviews.filter((review) => {
    if (reviewFilter === "all") return true;
    if (reviewFilter === "approved") return review.approved;
    return !review.approved;
  });

  return (
    <section className="mt-10 rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-[#e4cfad] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-3xl text-[#2f241e]">
            Gestión de reseñas
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
            Aprobá, ocultá o eliminá las reseñas recibidas desde el QR del
            salón.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setReviewFilter(item)}
              className={[
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition",
                reviewFilter === item
                  ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
                  : "border-[#dfc8ab] bg-white/50 text-[#5c473b] hover:bg-white",
              ].join(" ")}
            >
              {item === "all"
                ? "Todas"
                : item === "pending"
                  ? "Pendientes"
                  : "Publicadas"}
            </button>
          ))}
        </div>
      </div>

      {loadingReviews ? (
        <div className="grid min-h-64 place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0BB3A6]" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="mt-6 rounded-[1.2rem] border border-[#dfc8ab] bg-white/45 p-6 text-sm text-[#5c473b]">
          No hay reseñas para este filtro.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {filteredReviews.map((review) => (
            <ReviewAdminCard
              key={review.id}
              review={review}
              loading={reviewActionLoadingId === review.id}
              onApprove={() => onApprove(review.id)}
              onHide={() => onHide(review.id)}
              onDelete={() => onDelete(review.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewAdminCard({
  review,
  loading,
  onApprove,
  onHide,
  onDelete,
}: {
  review: Review;
  loading: boolean;
  onApprove: () => void;
  onHide: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-[1.45rem] border border-[#dfc8ab] bg-white/55 p-5 shadow-[0_12px_32px_rgba(90,64,50,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
                review.approved
                  ? "border-[#0BB3A6]/35 bg-[#0BB3A6]/12 text-[#087d75]"
                  : "border-[#e8c17f]/45 bg-[#e8c17f]/18 text-[#8a5b1f]",
              ].join(" ")}
            >
              {review.approved ? "Publicada" : "Pendiente"}
            </span>

            <span className="rounded-full border border-[#dfc8ab] bg-[#fff9f0] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d5748]">
              5 estrellas
            </span>
          </div>

          <h3 className="mt-3 font-display text-2xl text-[#2f241e]">
            {review.name || "Anónimo"}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
            “{review.message}”
          </p>

          <p className="mt-3 text-xs font-medium text-[#8a7667]">
            {new Date(review.created_at).toLocaleString("es-UY")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!review.approved && (
            <button
              onClick={onApprove}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-[#0BB3A6] px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white transition hover:bg-[#099f94] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Aprobar
            </button>
          )}

          {review.approved && (
            <button
              onClick={onHide}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:opacity-60"
            >
              <X size={15} />
              Ocultar
            </button>
          )}

          <button
            onClick={onDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            Borrar
          </button>
        </div>
      </div>
    </article>
  );
}

function ReservationCard({
  reservation,
  disabledRanges,
  loading,
  onApprove,
  onReject,
  onDepositChange,
  onSaveDetails,
  onSaveNotes,
  onDelete,
}: {
  reservation: Reservation;
  disabledRanges: DisabledReservationDateRange[];
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDepositChange: (value: boolean) => void;
  onSaveDetails: (values: ReservationUpdateValues) => Promise<boolean>;
  onSaveNotes: (notes: string) => void;
  onDelete: () => void;
}) {
  const [notesDraft, setNotesDraft] = useState(reservation.notes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");

  const [editDraft, setEditDraft] = useState({
    customer_name: reservation.customer_name,
    event_type: reservation.event_type,
    phone: reservation.phone,
    email: reservation.email || "",
    event_date: reservation.event_date,
    start_time: normalizeTime(reservation.start_time),
    end_time: normalizeTime(reservation.end_time),
    status: reservation.status,
    deposit_paid: reservation.deposit_paid,
    discovery_source: reservation.discovery_source || "",
  });

  useEffect(() => {
    setNotesDraft(reservation.notes || "");
    setEditDraft({
      customer_name: reservation.customer_name,
      event_type: reservation.event_type,
      phone: reservation.phone,
      email: reservation.email || "",
      event_date: reservation.event_date,
      start_time: normalizeTime(reservation.start_time),
      end_time: normalizeTime(reservation.end_time),
      status: reservation.status,
      deposit_paid: reservation.deposit_paid,
      discovery_source: reservation.discovery_source || "",
    });
    setEditError("");
  }, [reservation]);

  async function handleSaveDetails(event: FormEvent) {
    event.preventDefault();

    setEditError("");

    if (!editDraft.customer_name.trim()) {
      setEditError("Ingresá el nombre del cliente.");
      return;
    }

    if (!editDraft.event_type.trim()) {
      setEditError("Seleccioná el tipo de evento.");
      return;
    }

    if (!editDraft.phone.trim()) {
      setEditError("Ingresá el teléfono.");
      return;
    }

    if (!editDraft.event_date.trim()) {
      setEditError("Seleccioná la fecha del evento.");
      return;
    }

    if (isDateInDisabledRange(editDraft.event_date, disabledRanges)) {
      setEditError(
        "Esta fecha está inhabilitada. Habilitala primero para guardar la reserva.",
      );
      return;
    }

    const startTime = normalizeTime(editDraft.start_time);
    const endTime = normalizeTime(editDraft.end_time);

    if (!isValid24HourTime(startTime) || !isValid24HourTime(endTime)) {
      setEditError(
        "Ingresá inicio y fin en formato 24 horas. Ejemplo: 17:00.",
      );
      return;
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      setEditError(
        "El horario de inicio debe ser anterior al horario de fin.",
      );
      return;
    }

    const saved = await onSaveDetails({
      customer_name: editDraft.customer_name.trim(),
      event_type: editDraft.event_type,
      phone: editDraft.phone.trim(),
      email: editDraft.email.trim() || null,
      event_date: editDraft.event_date,
      start_time: startTime,
      end_time: endTime,
      status: editDraft.status,
      deposit_paid: editDraft.deposit_paid,
      discovery_source: editDraft.discovery_source || null,
    });

    if (saved) {
      setIsEditing(false);
    }
  }

  function cancelEdit() {
    setEditDraft({
      customer_name: reservation.customer_name,
      event_type: reservation.event_type,
      phone: reservation.phone,
      email: reservation.email || "",
      event_date: reservation.event_date,
      start_time: normalizeTime(reservation.start_time),
      end_time: normalizeTime(reservation.end_time),
      status: reservation.status,
      deposit_paid: reservation.deposit_paid,
      discovery_source: reservation.discovery_source || "",
    });
    setEditError("");
    setIsEditing(false);
  }

  return (
    <article className="rounded-[1.45rem] border border-[#dfc8ab] bg-white/55 p-5 shadow-[0_12px_32px_rgba(90,64,50,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
                statusClasses[reservation.status],
              ].join(" ")}
            >
              {statusLabels[reservation.status]}
            </span>

            <span className="rounded-full border border-[#dfc8ab] bg-[#fff9f0] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d5748]">
              {reservation.source === "website" ? "Web" : "Admin"}
            </span>

            {reservation.deposit_paid && (
              <span className="rounded-full border border-[#0BB3A6]/35 bg-[#0BB3A6]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#087d75]">
                Seña paga
              </span>
            )}
          </div>

          <h3 className="mt-3 font-display text-2xl text-[#2f241e]">
            {reservation.customer_name}
          </h3>

          <div className="mt-2 grid gap-1 text-sm text-[#5c473b]">
            <p>
              <b>Evento:</b> {reservation.event_type}
            </p>
            <p>
              <b>Fecha:</b> {formatDateForDisplay(reservation.event_date)}
            </p>
            <p>
              <b>Horario:</b> {normalizeTime(reservation.start_time)} a{" "}
              {normalizeTime(reservation.end_time)}
            </p>
            <p>
              <b>Tel:</b> {reservation.phone}
            </p>
            <p>
              <b>Email:</b> {reservation.email || "No indicado"}
            </p>
            {reservation.discovery_source && (
              <p>
                <b>Conoció Calypso por:</b> {reservation.discovery_source}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsEditing((prev) => !prev)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:opacity-60"
          >
            <Pencil size={15} />
            {isEditing ? "Cerrar edición" : "Editar"}
          </button>

          {reservation.status !== "approved" &&
            reservation.status !== "completed" && (
              <button
                onClick={onApprove}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-[#0BB3A6] px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white transition hover:bg-[#099f94] disabled:opacity-60"
              >
                <Check size={15} />
                Aprobar
              </button>
            )}

          {reservation.status !== "rejected" &&
            reservation.status !== "completed" && (
              <button
                onClick={onReject}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-red-700 transition hover:bg-red-100 disabled:opacity-60"
              >
                <X size={15} />
                Rechazar
              </button>
            )}

          <button
            onClick={onDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            Borrar
          </button>
        </div>
      </div>

      {isEditing && (
        <form
          onSubmit={handleSaveDetails}
          className="mt-5 rounded-[1.2rem] border border-[#dfc8ab] bg-[#fff9f0]/72 p-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Cliente
              </span>
              <input
                value={editDraft.customer_name}
                onChange={(event) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    customer_name: event.target.value,
                  }))
                }
                className="input-contact"
                placeholder="Nombre y apellido"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Tipo de evento
              </span>
              <select
                value={editDraft.event_type}
                onChange={(event) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    event_type: event.target.value,
                  }))
                }
                className="input-contact"
              >
                <option value="">Seleccioná una opción</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Teléfono
              </span>
              <input
                value={editDraft.phone}
                onChange={(event) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
                className="input-contact"
                placeholder="+598..."
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Email
              </span>
              <input
                type="email"
                value={editDraft.email}
                onChange={(event) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                className="input-contact"
                placeholder="cliente@email.com"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Fecha
              </span>
              <input
                type="date"
                value={editDraft.event_date}
                onChange={(event) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    event_date: event.target.value,
                  }))
                }
                className="input-contact"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Estado
              </span>
              <select
                value={editDraft.status}
                onChange={(event) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    status: event.target.value as ReservationStatus,
                  }))
                }
                className="input-contact"
              >
                {(
                  [
                    "pending",
                    "approved",
                    "rejected",
                    "expired",
                    "completed",
                  ] as ReservationStatus[]
                ).map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Inicio
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-2][0-9]:[0-5][0-9]"
                maxLength={5}
                value={editDraft.start_time}
                onChange={(event) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    start_time: event.target.value,
                  }))
                }
                className="input-contact"
                placeholder="17:00"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Fin
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-2][0-9]:[0-5][0-9]"
                maxLength={5}
                value={editDraft.end_time}
                onChange={(event) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    end_time: event.target.value,
                  }))
                }
                className="input-contact"
                placeholder="20:00"
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Cómo conoció Calypso
              </span>
              <select
                value={editDraft.discovery_source}
                onChange={(event) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    discovery_source: event.target.value,
                  }))
                }
                className="input-contact"
              >
                <option value="">No indicado</option>
                {DISCOVERY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 text-sm font-semibold text-[#2f241e] md:col-span-2">
              <input
                type="checkbox"
                checked={editDraft.deposit_paid}
                onChange={(event) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    deposit_paid: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[#0BB3A6]"
              />
              Pagó seña
            </label>
          </div>

          {editError && (
            <p className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {editError}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-[#0BB3A6] px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white transition hover:bg-[#099f94] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Guardar cambios
            </button>

            <button
              type="button"
              onClick={cancelEdit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:opacity-60"
            >
              <X size={15} />
              Cancelar
            </button>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[#6d5748]/75">
            Usá esta edición para completar datos faltantes, como email, teléfono,
            fecha, horario, estado o cómo conoció Calypso.
          </p>
        </form>
      )}

      <div className="mt-5 grid gap-4 border-t border-[#e4cfad] pt-5 lg:grid-cols-[0.8fr_1.2fr]">
        <label className="flex items-center gap-3 rounded-[1rem] border border-[#dfc8ab] bg-[#fff9f0]/72 px-4 py-3 text-sm font-semibold text-[#2f241e]">
          <input
            type="checkbox"
            checked={reservation.deposit_paid}
            onChange={(event) => onDepositChange(event.target.checked)}
            className="h-4 w-4 accent-[#0BB3A6]"
          />
          Pagó seña
        </label>

        <div>
          <textarea
            value={notesDraft}
            onChange={(event) => setNotesDraft(event.target.value)}
            className="input-contact min-h-24 resize-none"
            placeholder="Notas internas: menú, personal requerido, detalles..."
          />

          <button
            onClick={() => onSaveNotes(notesDraft)}
            disabled={loading}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-white disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Guardar notas
          </button>
        </div>
      </div>
    </article>
  );
}


function ReservationCalendar({
  selectedDate,
  calendarMonth,
  monthBlocks,
  disabledRanges,
  loading,
  minDate,
  onMonthChange,
  onSelectDate,
}: {
  selectedDate: string;
  calendarMonth: Date;
  monthBlocks: ReservationBlock[];
  disabledRanges: DisabledReservationDateRange[];
  loading: boolean;
  minDate: string;
  onMonthChange: (date: Date) => void;
  onSelectDate: (dateValue: string) => void;
}) {
  const days = getCalendarDays(calendarMonth);
  const month = calendarMonth.getMonth();
  const weekDays = ["D", "L", "M", "M", "J", "V", "S"];

  const getDateAvailability = (dateValue: string) => {
    const dateBlocks = monthBlocks.filter(
      (block) => block.event_date === dateValue,
    );

    const slots = getSlotsForDate(dateValue);
    const available = getAvailableSlots(dateValue, dateBlocks);

    if (dateValue < minDate) return "disabled";
    if (isDateInDisabledRange(dateValue, disabledRanges)) return "closed";
    if (dateBlocks.length === 0) return "available";
    if (available.length === 0) return "full";
    if (available.length < slots.length) return "partial";

    return "available";
  };

  const previousMonth = () => {
    const next = new Date(calendarMonth);
    next.setMonth(next.getMonth() - 1);
    onMonthChange(next);
  };

  const nextMonth = () => {
    const next = new Date(calendarMonth);
    next.setMonth(next.getMonth() + 1);
    onMonthChange(next);
  };

  return (
    <div className="rounded-[1.4rem] border border-[#d1af7e] bg-[#fff4df]/80 p-4 shadow-[0_14px_34px_rgba(90,64,50,0.07)]">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={previousMonth}
          className="grid h-10 w-10 place-items-center rounded-full border border-[#d1af7e] bg-[#fff9f0] text-[#2f241e] transition hover:bg-white"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p className="font-display text-xl capitalize text-[#2f241e]">
            {getMonthLabel(calendarMonth)}
          </p>

          {loading && (
            <p className="mt-1 text-xs font-semibold text-[#087d75]">
              Consultando disponibilidad...
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="grid h-10 w-10 place-items-center rounded-full border border-[#d1af7e] bg-[#fff9f0] text-[#2f241e] transition hover:bg-white"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center">
        {weekDays.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a5b1f]"
          >
            {day}
          </div>
        ))}

        {days.map((date) => {
          const dateValue = toInputDate(date);
          const availability = getDateAvailability(dateValue);

          const selected = selectedDate === dateValue && availability !== "closed";
          const outsideMonth = date.getMonth() !== month;
          const disabled = availability === "disabled" || availability === "closed";

          return (
            <button
              key={dateValue}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(dateValue)}
              className={[
                "relative min-h-12 rounded-2xl border px-2 py-2 text-sm font-bold transition",
                outsideMonth ? "opacity-35" : "",
                selected
                  ? "border-[#0BB3A6] bg-[#0BB3A6] text-white shadow-[0_12px_26px_rgba(11,179,166,0.20)]"
                  : availability === "closed"
                    ? "cursor-not-allowed border-red-300 bg-red-100 text-red-700"
                    : availability === "full"
                      ? "border-red-300 bg-red-100 text-red-700 hover:bg-red-50"
                      : availability === "partial"
                      ? "border-[#d89b38] bg-[#f4c76f]/45 text-[#6f4311] hover:bg-[#f4c76f]/60"
                      : availability === "disabled"
                        ? "cursor-not-allowed border-stone-300 bg-stone-200 text-stone-500"
                        : "border-[#d1af7e] bg-[#fff0d2] text-[#2f241e] hover:-translate-y-0.5 hover:border-[#0BB3A6]/55 hover:bg-[#fff7eb]",
              ].join(" ")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#5c473b]">
        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#fff0d2] ring-1 ring-[#d1af7e]" />
          Disponible
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#f4c76f]/70 ring-1 ring-[#d89b38]" />
          Parcial
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-100 ring-1 ring-red-300" />
          Inhabilitada / con reservas
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-stone-200 ring-1 ring-stone-300" />
          No disponible
        </div>
      </div>
    </div>
  );
}