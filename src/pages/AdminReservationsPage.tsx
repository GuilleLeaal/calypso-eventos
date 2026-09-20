import { useEffect, useMemo, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { motion, circOut } from "framer-motion";
import {
  ArrowLeft,
  CalendarOff,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Lock,
  LogOut,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  StickyNote,
  User,
  WalletCards,
  CalendarCheck,
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

type AdminSection = "reservations" | "completed_events" | "disabled_dates" | "reviews";

type ReservationSource = "website" | "admin";

type Reservation = {
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

type ManualReservationFormValues = {
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

type ReservationUpdateValues = Partial<
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

const FIRST_RESERVATION_DATE = "2026-07-01";
const MAX_CHILDREN_COUNT = 30;
const MAX_ADULTS_COUNT = 50;
const RESERVATIONS_PER_PAGE = 4;

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

type ExcelColumnOptions = {
  index: number;
  numberFormat?: string;
  minWidth?: number;
  maxWidth?: number;
};

async function downloadExcelFile({
  filename,
  sheetName,
  headers,
  rows,
  columnOptions = [],
}: {
  filename: string;
  sheetName: string;
  headers: string[];
  rows: unknown[][];
  columnOptions?: ExcelColumnOptions[];
}) {
  // Carga ExcelJS solo cuando el usuario exporta, evitando aumentar el bundle inicial del admin.
  const { Workbook } = await import("exceljs");

  const workbook = new Workbook();
  workbook.creator = "Calypso Eventos";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.addRow(headers);
  rows.forEach((row) => worksheet.addRow(row));

  const headerRow = worksheet.getRow(1);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0BB3A6" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "left",
    };
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length },
  };

  // Ajusta automáticamente cada columna al texto más largo, con límites razonables
  // para que textos excepcionales no generen columnas gigantes.
  worksheet.columns.forEach((_column, columnIndex) => {
    // worksheet.columns expone columnas parciales en los tipos de ExcelJS,
    // por eso obtenemos la columna concreta con getColumn antes de usar eachCell.
    const column = worksheet.getColumn(columnIndex + 1);
    const options = columnOptions.find((item) => item.index === columnIndex + 1);
    const minWidth = options?.minWidth ?? 12;
    const maxWidth = options?.maxWidth ?? 42;
    let longestText = headers[columnIndex]?.length ?? 0;

    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellText = cell.text || String(cell.value ?? "");

      for (const line of cellText.split(/\r?\n/)) {
        longestText = Math.max(longestText, line.length);
      }
    });

    column.width = Math.min(Math.max(longestText + 2, minWidth), maxWidth);

    if (options?.numberFormat) {
      column.numFmt = options.numberFormat;
    }
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    row.alignment = {
      vertical: "middle",
    };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function normalizeClientIdentityValue(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLocaleLowerCase("es-UY")
    .replace(/\s+/g, " ");
}

function getClientExportKey(reservation: Reservation) {
  const phone = (reservation.phone || "").replace(/\D/g, "");
  if (phone) return `phone:${phone}`;

  const email = normalizeClientIdentityValue(reservation.email);
  if (email) return `email:${email}`;

  return `name:${normalizeClientIdentityValue(reservation.customer_name)}`;
}

function parseOptionalCurrency(value: string) {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) return null;

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) return Number.NaN;

  return Math.round(amount * 100) / 100;
}

function parseOptionalInteger(value: string) {
  const normalized = value.trim();

  if (!normalized) return null;

  const amount = Number(normalized);

  if (!Number.isInteger(amount) || amount < 0) return Number.NaN;

  return amount;
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "No indicado";

  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(value);
}

function getEventTotalIncome(reservation: Pick<Reservation, "deposit_amount" | "settlement_amount">) {
  return Number(reservation.deposit_amount ?? 0) + Number(reservation.settlement_amount ?? 0);
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

function getDisabledRangeForDate(
  dateValue: string,
  disabledRanges: DisabledReservationDateRange[],
) {
  return disabledRanges.find(
    (range) => dateValue >= range.start_date && dateValue <= range.end_date,
  );
}

function isDateInDisabledRange(
  dateValue: string,
  disabledRanges: DisabledReservationDateRange[],
) {
  return Boolean(getDisabledRangeForDate(dateValue, disabledRanges));
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
  const [reservationPage, setReservationPage] = useState(1);
  const [reservationTotalCount, setReservationTotalCount] = useState(0);
  const [reservationSearch, setReservationSearch] = useState("");
  const [debouncedReservationSearch, setDebouncedReservationSearch] = useState("");
  const [reservationDateFromFilter, setReservationDateFromFilter] = useState("");
  const [reservationDateToFilter, setReservationDateToFilter] = useState("");
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
  const [manualMonthReservations, setManualMonthReservations] = useState<
    Reservation[]
  >([]);
  const [loadingManualSlots, setLoadingManualSlots] = useState(false);
  const [loadingManualMonthBlocks, setLoadingManualMonthBlocks] =
    useState(false);

  const [manualCalendarMonth, setManualCalendarMonth] = useState(() =>
    createLocalDate(getMinReservationDate()),
  );

  const [manualForm, setManualForm] = useState<ManualReservationFormValues>({
    customer_name: "",
    event_type: "",
    phone: "",
    email: "",
    children_count: "",
    adults_count: "",
    event_date: getMinReservationDate(),
    start_time: "17:00",
    end_time: "20:00",
    notes: "",
    deposit_paid: false,
    agreed_price: "",
    deposit_amount: "",
    waiters_count: "",
    animators_count: "",
    discovery_source: "",
  });

  const manualSlots = useMemo(() => {
    if (isDateInDisabledRange(manualForm.event_date, disabledRanges)) {
      return [];
    }

    return getAvailableSlots(manualForm.event_date, manualBlocks);
  }, [manualForm.event_date, manualBlocks, disabledRanges]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedReservationSearch(reservationSearch.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [reservationSearch]);

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

      if (!hasSession) {
        setReservations([]);
        setReviews([]);
        setDisabledRanges([]);
        setManualBlocks([]);
        setManualMonthBlocks([]);
        setManualMonthReservations([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchDisabledRanges();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && activeSection === "reviews") {
      fetchReviews();
    }
  }, [isLoggedIn, activeSection]);

  useEffect(() => {
    if (isLoggedIn && activeSection === "reservations") {
      fetchManualBlocks();
    }
  }, [manualForm.event_date, isLoggedIn, activeSection]);

  useEffect(() => {
    if (isLoggedIn && activeSection === "reservations") {
      fetchManualMonthBlocks();
    }
  }, [manualCalendarMonth, isLoggedIn, activeSection]);

  useEffect(() => {
    if (
      isLoggedIn &&
      (activeSection === "reservations" || activeSection === "completed_events")
    ) {
      fetchReservations();
    }
  }, [
    isLoggedIn,
    activeSection,
    filter,
    reservationPage,
    debouncedReservationSearch,
    reservationDateFromFilter,
    reservationDateToFilter,
  ]);

  useEffect(() => {
    if (
      !isLoggedIn ||
      (activeSection !== "reservations" && activeSection !== "completed_events")
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void fetchReservations(true);
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [
    isLoggedIn,
    activeSection,
    filter,
    reservationPage,
    debouncedReservationSearch,
    reservationDateFromFilter,
    reservationDateToFilter,
  ]);

  const reservationTotalPages = Math.max(
    1,
    Math.ceil(reservationTotalCount / RESERVATIONS_PER_PAGE),
  );

  const reservationFirstItem =
    reservationTotalCount === 0
      ? 0
      : (reservationPage - 1) * RESERVATIONS_PER_PAGE + 1;

  const reservationLastItem = Math.min(
    reservationPage * RESERVATIONS_PER_PAGE,
    reservationTotalCount,
  );

  const hasReservationFilters = Boolean(
    reservationSearch.trim() ||
      reservationDateFromFilter ||
      reservationDateToFilter ||
      (activeSection === "reservations" && filter !== "all"),
  );

  function clearReservationFilters() {
    setReservationSearch("");
    setDebouncedReservationSearch("");
    setReservationDateFromFilter("");
    setReservationDateToFilter("");
    setFilter("all");
    setReservationPage(1);
  }

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

    const { data: rangeReservations, error: rangeReservationsError } = await supabase
      .from("reservations")
      .select("id, customer_name, event_date, start_time, end_time, status")
      .gte("event_date", disabledForm.start_date)
      .lte("event_date", disabledForm.end_date)
      .neq("status", "rejected")
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (rangeReservationsError) {
      console.error("Error checking reservations in disabled range:", rangeReservationsError);
      setGlobalError(
        "No pudimos verificar las reservas existentes para ese rango. Intentá nuevamente.",
      );
      return;
    }

    const reservationsInRange = (rangeReservations || []) as Pick<
      Reservation,
      "id" | "customer_name" | "event_date" | "start_time" | "end_time" | "status"
    >[];

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
      const [blocksResult, reservationsResult] = await Promise.all([
        supabase.rpc("get_public_reservation_blocks_range", {
          start_date: start,
          end_date: end,
        }),
        supabase
          .from("reservations")
          .select(
            "id, customer_name, event_type, phone, email, children_count, adults_count, event_date, start_time, end_time, status, deposit_paid, notes, source, discovery_source, agreed_price, settlement_amount, deposit_amount, staff_count, waiters_count, animators_count, created_at, updated_at",
          )
          .gte("event_date", start)
          .lte("event_date", end)
          .neq("status", "rejected")
          .order("event_date", { ascending: true })
          .order("start_time", { ascending: true }),
      ]);

      if (blocksResult.error) {
        console.error("Error fetching manual month blocks:", blocksResult.error);
        setManualMonthBlocks([]);
      } else {
        setManualMonthBlocks((blocksResult.data || []) as ReservationBlock[]);
      }

      if (reservationsResult.error) {
        console.error("Error fetching month reservations:", reservationsResult.error);
        setManualMonthReservations([]);
      } else {
        setManualMonthReservations((reservationsResult.data || []) as Reservation[]);
      }
    } catch (error) {
      console.error("Unexpected manual month blocks error:", error);
      setManualMonthBlocks([]);
      setManualMonthReservations([]);
    } finally {
      setLoadingManualMonthBlocks(false);
    }
  }

  async function fetchReservations(silent = false) {
    if (!silent) {
      setLoadingReservations(true);
    }
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

      const from = (reservationPage - 1) * RESERVATIONS_PER_PAGE;
      const to = from + RESERVATIONS_PER_PAGE - 1;

      let query = supabase
        .from("reservations")
        .select("*", { count: "exact" });

      if (activeSection === "completed_events") {
        query = query.eq("status", "completed");
      } else {
        query = query.neq("status", "completed");

        if (filter !== "all") {
          query = query.eq("status", filter);
        }
      }

      if (debouncedReservationSearch) {
        query = query.ilike("customer_name", `%${debouncedReservationSearch}%`);
      }

      if (reservationDateFromFilter) {
        query = query.gte("event_date", reservationDateFromFilter);
      }

      if (reservationDateToFilter) {
        query = query.lte("event_date", reservationDateToFilter);
      }

      const showNewestFirst = activeSection === "completed_events";

      const { data, error, count } = await query
        .order("event_date", { ascending: !showNewestFirst })
        .order("start_time", { ascending: !showNewestFirst })
        .range(from, to);

      if (error) {
        console.error("Error fetching reservations:", error);
        setGlobalError(
          "No pudimos cargar las reservas. Revisá permisos de Supabase.",
        );
        setReservations([]);
        setReservationTotalCount(0);
        return;
      }

      const total = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / RESERVATIONS_PER_PAGE));

      if (reservationPage > totalPages) {
        setReservationPage(totalPages);
        return;
      }

      setReservations((data || []) as Reservation[]);
      setReservationTotalCount(total);
    } catch (error) {
      console.error("Unexpected fetch reservations error:", error);
      setGlobalError("Ocurrió un error cargando las reservas.");
      setReservations([]);
      setReservationTotalCount(0);
    } finally {
      if (!silent) {
        setLoadingReservations(false);
      }
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
    if (activeSection === "reservations") {
      await Promise.all([
        fetchReservations(),
        fetchDisabledRanges(),
        fetchManualBlocks(),
        fetchManualMonthBlocks(),
      ]);
      return;
    }

    if (activeSection === "completed_events") {
      await Promise.all([fetchReservations(), fetchDisabledRanges()]);
      return;
    }

    if (activeSection === "disabled_dates") {
      await fetchDisabledRanges();
      return;
    }

    await fetchReviews();
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

    const affectsAvailability = [
      "event_date",
      "start_time",
      "end_time",
      "status",
    ].some((field) => field in values);

    await fetchReservations(true);

    if (affectsAvailability) {
      await Promise.all([fetchManualBlocks(), fetchManualMonthBlocks()]);
    }

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
      await fetchReservations(true);
      await Promise.all([fetchManualBlocks(), fetchManualMonthBlocks()]);
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

    const childrenCount = Number(manualForm.children_count);
    const adultsCount = Number(manualForm.adults_count);

    if (!manualForm.children_count.trim() || Number.isNaN(childrenCount) || childrenCount < 0) {
      setGlobalError("Ingresá la cantidad de niños.");
      return;
    }

    if (!Number.isInteger(childrenCount)) {
      setGlobalError("La cantidad de niños debe ser un número entero.");
      return;
    }

    if (childrenCount > MAX_CHILDREN_COUNT) {
      setGlobalError(`La cantidad máxima permitida es de ${MAX_CHILDREN_COUNT} niños.`);
      return;
    }

    if (!manualForm.adults_count.trim() || Number.isNaN(adultsCount) || adultsCount < 0) {
      setGlobalError("Ingresá la cantidad de adultos.");
      return;
    }

    if (!Number.isInteger(adultsCount)) {
      setGlobalError("La cantidad de adultos debe ser un número entero.");
      return;
    }

    if (adultsCount > MAX_ADULTS_COUNT) {
      setGlobalError(`La cantidad máxima permitida es de ${MAX_ADULTS_COUNT} adultos.`);
      return;
    }

    if (childrenCount + adultsCount <= 0) {
      setGlobalError("La cantidad total de invitados debe ser mayor a 0.");
      return;
    }

    const agreedPrice = parseOptionalCurrency(manualForm.agreed_price);
    const depositAmount = parseOptionalCurrency(manualForm.deposit_amount);
    const waitersCount = parseOptionalInteger(manualForm.waiters_count);
    const animatorsCount = parseOptionalInteger(manualForm.animators_count);

    if (Number.isNaN(agreedPrice)) {
      setGlobalError("El precio pautado debe ser un importe válido.");
      return;
    }


    if (Number.isNaN(depositAmount)) {
      setGlobalError("La seña debe ser un importe válido.");
      return;
    }

    if (Number.isNaN(waitersCount)) {
      setGlobalError("La cantidad de mozos debe ser un número entero.");
      return;
    }

    if (Number.isNaN(animatorsCount)) {
      setGlobalError("La cantidad de animadores debe ser un número entero.");
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

    const { error } = await supabase.rpc("create_admin_reservation_v2", {
      p_customer_name: manualForm.customer_name.trim(),
      p_event_type: manualForm.event_type,
      p_phone: manualForm.phone.trim(),
      p_email: manualForm.email.trim(),
      p_event_date: manualForm.event_date,
      p_start_time: startTime,
      p_end_time: endTime,
      p_children_count: childrenCount,
      p_adults_count: adultsCount,
      p_deposit_paid: manualForm.deposit_paid,
      p_notes: manualForm.notes.trim(),
      p_discovery_source: manualForm.discovery_source,
      p_agreed_price: agreedPrice,
      p_deposit_amount: depositAmount,
      p_waiters_count: waitersCount,
      p_animators_count: animatorsCount,
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
      children_count: "",
      adults_count: "",
      event_date: getMinReservationDate(),
      start_time: "17:00",
      end_time: "20:00",
      notes: "",
      deposit_paid: false,
      agreed_price: "",
      deposit_amount: "",
      waiters_count: "",
      animators_count: "",
      discovery_source: "",
    });

    setManualCalendarMonth(createLocalDate(getMinReservationDate()));

    await fetchReservations(true);
    await Promise.all([fetchManualBlocks(), fetchManualMonthBlocks()]);
  }

  function applyManualSlot(slot: ReservationSlot) {
    setManualForm((prev) => ({
      ...prev,
      start_time: slot.startTime,
      end_time: slot.endTime,
    }));
  }

  async function fetchCompletedReservationsForExport() {
    const { error: completeError } = await supabase.rpc(
      "mark_completed_reservations",
    );

    if (completeError) {
      console.error("Error marking completed before export:", completeError);
    }

    const { data, error } = await supabase
      .from("reservations")
      .select(
        "id, customer_name, event_type, phone, email, children_count, adults_count, event_date, start_time, end_time, status, deposit_paid, notes, source, discovery_source, agreed_price, settlement_amount, deposit_amount, staff_count, waiters_count, animators_count, created_at, updated_at",
      )
      .eq("status", "completed")
      .order("event_date", { ascending: false })
      .order("end_time", { ascending: false });

    if (error) {
      console.error("Error exporting completed reservations:", error);
      throw new Error("No pudimos obtener los eventos finalizados.");
    }

    return (data || []) as Reservation[];
  }

  async function downloadClientsExcel() {
    setGlobalError("");

    try {
      const { data, error } = await supabase
        .from("reservations")
        .select(
          "id, customer_name, event_type, phone, email, children_count, adults_count, event_date, start_time, end_time, status, deposit_paid, notes, source, discovery_source, agreed_price, settlement_amount, deposit_amount, staff_count, waiters_count, animators_count, created_at, updated_at",
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error exporting clients:", error);
        setGlobalError("No pudimos obtener la información de los clientes.");
        return;
      }

      const allReservations = (data || []) as Reservation[];

      if (allReservations.length === 0) {
        setGlobalError("No hay clientes registrados todavía.");
        return;
      }

      const uniqueClients = new Map<string, Reservation>();

      for (const reservation of allReservations) {
        const key = getClientExportKey(reservation);

        // La consulta viene ordenada por creación, de la más reciente a la más antigua.
        // Si un cliente aparece en varias reservas, conservamos sus datos más recientes.
        if (!uniqueClients.has(key)) {
          uniqueClients.set(key, reservation);
        }
      }

      const headers = [
        "Nombre del cliente",
        "Teléfono",
        "Email",
        "Cómo conoció Calypso",
      ];

      const rows = Array.from(uniqueClients.values())
        .sort((a, b) => a.customer_name.localeCompare(b.customer_name, "es-UY"))
        .map((reservation) => [
          reservation.customer_name,
          reservation.phone,
          reservation.email || "",
          reservation.discovery_source || "",
        ]);

      await downloadExcelFile({
        filename: `clientes-calypso-${getTodayInputValue()}.xlsx`,
        sheetName: "Clientes",
        headers,
        rows,
        columnOptions: [
          { index: 1, minWidth: 20, maxWidth: 40 },
          { index: 2, minWidth: 16, maxWidth: 24 },
          { index: 3, minWidth: 24, maxWidth: 42 },
          { index: 4, minWidth: 22, maxWidth: 38 },
        ],
      });
    } catch (error) {
      console.error("Unexpected client export error:", error);
      setGlobalError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error generando el archivo de clientes.",
      );
    }
  }

  async function downloadEventsExcel() {
    setGlobalError("");

    try {
      const completedReservations = await fetchCompletedReservationsForExport();

      if (completedReservations.length === 0) {
        setGlobalError(
          "No hay eventos finalizados todavía para generar el archivo de eventos.",
        );
        return;
      }

      const headers = [
        "Nombre del cliente",
        "Evento",
        "Fecha",
        "Cantidad de adultos",
        "Cantidad de niños",
        "Cantidad de mozos",
        "Cantidad de animadores",
        "Ingreso total",
      ];

      const rows = completedReservations.map((reservation) => [
        reservation.customer_name,
        reservation.event_type,
        new Date(`${reservation.event_date}T12:00:00`),
        reservation.adults_count ?? "",
        reservation.children_count ?? "",
        reservation.waiters_count ?? "",
        reservation.animators_count ?? "",
        getEventTotalIncome(reservation),
      ]);

      await downloadExcelFile({
        filename: `eventos-finalizados-calypso-${getTodayInputValue()}.xlsx`,
        sheetName: "Eventos finalizados",
        headers,
        rows,
        columnOptions: [
          { index: 1, minWidth: 20, maxWidth: 40 },
          { index: 2, minWidth: 20, maxWidth: 38 },
          { index: 3, numberFormat: "dd/mm/yyyy", minWidth: 14, maxWidth: 16 },
          { index: 4, minWidth: 18, maxWidth: 22 },
          { index: 5, minWidth: 16, maxWidth: 20 },
          { index: 6, minWidth: 18, maxWidth: 22 },
          { index: 7, minWidth: 20, maxWidth: 24 },
          { index: 8, numberFormat: '$ #,##0', minWidth: 16, maxWidth: 24 },
        ],
      });

      await fetchReservations();
    } catch (error) {
      console.error("Unexpected event export error:", error);
      setGlobalError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error generando el archivo de eventos.",
      );
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
      <main className="relative min-h-[100svh] overflow-x-clip bg-[#f6f0e7] pt-32">
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
    <main className="relative min-h-[100svh] overflow-x-clip bg-[#f6f0e7] pt-32">
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
            <details className="group relative">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/55 px-5 py-3 text-sm font-semibold text-[#2f241e] transition hover:bg-white [&::-webkit-details-marker]:hidden">
                <Download size={16} />
                Exportar Excel
                <ChevronDown
                  size={15}
                  className="transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-[1.2rem] border border-[#dfc8ab] bg-[#fff9f0] p-2 shadow-[0_18px_45px_rgba(90,64,50,0.16)]">
                <button
                  type="button"
                  onClick={downloadClientsExcel}
                  className="w-full rounded-[0.9rem] px-4 py-3 text-left transition hover:bg-white"
                >
                  <span className="block text-sm font-bold text-[#2f241e]">
                    Clientes
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#6d5748]">
                    Todos los clientes registrados, sin importar el estado del evento.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={downloadEventsExcel}
                  className="w-full rounded-[0.9rem] px-4 py-3 text-left transition hover:bg-white"
                >
                  <span className="block text-sm font-bold text-[#2f241e]">
                    Eventos finalizados
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#6d5748]">
                    Cliente, evento, fecha, invitados, personal e ingreso total.
                  </span>
                </button>
              </div>
            </details>

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

        <div className="-mx-1 mt-8 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveSection("reservations");
              setReservationPage(1);
            }}
            className={[
              "shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.09em] transition sm:px-5 sm:py-3 sm:text-sm",
              activeSection === "reservations"
                ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
                : "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:bg-white",
            ].join(" ")}
          >
            Reservas
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection("completed_events");
              setReservationPage(1);
            }}
            className={[
              "shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.09em] transition sm:px-5 sm:py-3 sm:text-sm",
              activeSection === "completed_events"
                ? "border-[#2f241e] bg-[#2f241e] text-white"
                : "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:bg-white",
            ].join(" ")}
          >
            Eventos finalizados
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("disabled_dates")}
            className={[
              "shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.09em] transition sm:px-5 sm:py-3 sm:text-sm",
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
              "shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.09em] transition sm:px-5 sm:py-3 sm:text-sm",
              activeSection === "reviews"
                ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
                : "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:bg-white",
            ].join(" ")}
          >
            Reseñas
          </button>
          </div>
        </div>

        {globalError && (
          <p className="mt-7 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {globalError}
          </p>
        )}

        {activeSection === "reservations" && (
          <div className="mt-10 grid gap-7 xl:grid-cols-[0.72fr_1.28fr]">
            <details className="group rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-5 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[1.2rem] border border-[#dfc8ab] bg-white/50 px-4 py-3 text-left transition hover:bg-white [&::-webkit-details-marker]:hidden">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#087d75]">
                    Reserva manual
                  </p>
                  <h2 className="mt-1 font-display text-2xl text-[#2f241e]">
                    Crear reserva
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#6d5748]">
                    Tocalo solo si necesitás cargar una reserva desde el celular.
                  </p>
                </div>

                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/12 text-[#0BB3A6] transition group-open:rotate-45">
                  <Plus size={18} />
                </span>
              </summary>

              <div className="mt-5 border-t border-[#e4cfad] pt-5">
              <ManualReservationForm
                  form={manualForm}
                  setForm={setManualForm}
                  onSubmit={handleCreateManualReservation}
                  calendarMonth={manualCalendarMonth}
                  onCalendarMonthChange={setManualCalendarMonth}
                  monthBlocks={manualMonthBlocks}
                  monthReservations={manualMonthReservations}
                  disabledRanges={disabledRanges}
                  loadingMonth={loadingManualMonthBlocks}
                  manualSlots={manualSlots}
                  loadingSlots={loadingManualSlots}
                  onApplySlot={applyManualSlot}
                />
              </div>
            </details>

            <section className="hidden rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur lg:block xl:sticky xl:top-24 xl:self-start">
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

              <ManualReservationForm
                  form={manualForm}
                  setForm={setManualForm}
                  onSubmit={handleCreateManualReservation}
                  calendarMonth={manualCalendarMonth}
                  onCalendarMonthChange={setManualCalendarMonth}
                  monthBlocks={manualMonthBlocks}
                  monthReservations={manualMonthReservations}
                  disabledRanges={disabledRanges}
                  loadingMonth={loadingManualMonthBlocks}
                  manualSlots={manualSlots}
                  loadingSlots={loadingManualSlots}
                  onApplySlot={applyManualSlot}
                />
            </section>

            <section className="rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur">
              <div className="flex flex-col gap-4 border-b border-[#e4cfad] pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-display text-3xl text-[#2f241e]">
                    Reservas
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
                    Pendientes, aprobadas, rechazadas y vencidas. Cuando termina el horario del evento,
                    pasa automáticamente a Eventos finalizados. La lista carga de a {RESERVATIONS_PER_PAGE}.
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
                    ] as const
                  ).map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setFilter(item);
                        setReservationPage(1);
                      }}
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

              <ReservationSearchFilters
                search={reservationSearch}
                dateFrom={reservationDateFromFilter}
                dateTo={reservationDateToFilter}
                totalCount={reservationTotalCount}
                loading={loadingReservations}
                hasFilters={hasReservationFilters}
                resultLabel="reservas"
                ariaContext="reservas"
                onSearchChange={(value) => {
                  setReservationSearch(value);
                  setReservationPage(1);
                }}
                onDateFromChange={(value) => {
                  setReservationDateFromFilter(value);
                  setReservationDateToFilter((currentTo) =>
                    currentTo && value && currentTo < value ? value : currentTo,
                  );
                  setReservationPage(1);
                }}
                onDateToChange={(value) => {
                  setReservationDateToFilter(value);
                  setReservationPage(1);
                }}
                onClear={clearReservationFilters}
              />

              {loadingReservations ? (
                <div className="grid min-h-64 place-items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0BB3A6]" />
                </div>
              ) : reservations.length === 0 ? (
                <div className="mt-6 rounded-[1.2rem] border border-[#dfc8ab] bg-white/45 p-6 text-sm text-[#5c473b]">
                  {reservationSearch.trim() || reservationDateFromFilter || reservationDateToFilter
                    ? "No hay reservas para esa búsqueda o rango de fechas."
                    : "No hay reservas para este filtro."}
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d5748]">
                    Mostrando {reservationFirstItem}-{reservationLastItem} de {reservationTotalCount}
                  </div>

                  {reservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      isCompletedView={false}
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

                  {reservationTotalPages > 1 && (
                    <div className="flex flex-col gap-3 rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-semibold text-[#6d5748]">
                        Página {reservationPage} de {reservationTotalPages}
                      </p>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={reservationPage <= 1 || loadingReservations}
                          onClick={() => setReservationPage((page) => Math.max(1, page - 1))}
                          className="rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          Anterior
                        </button>

                        <button
                          type="button"
                          disabled={reservationPage >= reservationTotalPages || loadingReservations}
                          onClick={() =>
                            setReservationPage((page) =>
                              Math.min(reservationTotalPages, page + 1),
                            )
                          }
                          className="rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {activeSection === "completed_events" && (
          <section className="mt-10 rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur">
            <div className="flex flex-col gap-4 border-b border-[#e4cfad] pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#2f241e]">
                  <CalendarCheck size={20} />
                  <h2 className="font-display text-3xl">Eventos finalizados</h2>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5c473b]">
                  Historial de eventos cuyo horario ya terminó. Se muestran primero los más recientes.
                  El estado se sincroniza automáticamente mientras el panel permanece abierto.
                </p>
              </div>

              <span className="w-fit rounded-full border border-[#2f241e]/15 bg-[#2f241e]/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#2f241e]">
                {reservationTotalCount} finalizado{reservationTotalCount === 1 ? "" : "s"}
              </span>
            </div>

            <ReservationSearchFilters
              search={reservationSearch}
              dateFrom={reservationDateFromFilter}
              dateTo={reservationDateToFilter}
              totalCount={reservationTotalCount}
              loading={loadingReservations}
              hasFilters={hasReservationFilters}
              resultLabel="eventos finalizados"
              ariaContext="eventos finalizados"
              onSearchChange={(value) => {
                setReservationSearch(value);
                setReservationPage(1);
              }}
              onDateFromChange={(value) => {
                setReservationDateFromFilter(value);
                setReservationDateToFilter((currentTo) =>
                  currentTo && value && currentTo < value ? value : currentTo,
                );
                setReservationPage(1);
              }}
              onDateToChange={(value) => {
                setReservationDateToFilter(value);
                setReservationPage(1);
              }}
              onClear={clearReservationFilters}
            />

            {loadingReservations ? (
              <div className="grid min-h-64 place-items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0BB3A6]" />
              </div>
            ) : reservations.length === 0 ? (
              <div className="mt-6 rounded-[1.2rem] border border-[#dfc8ab] bg-white/45 p-6 text-sm text-[#5c473b]">
                {reservationSearch.trim() || reservationDateFromFilter || reservationDateToFilter
                  ? "No hay eventos finalizados para esa búsqueda o rango de fechas."
                  : "Todavía no hay eventos finalizados."}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d5748]">
                  Mostrando {reservationFirstItem}-{reservationLastItem} de {reservationTotalCount}
                </div>

                {reservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    isCompletedView
                    disabledRanges={disabledRanges}
                    loading={actionLoadingId === reservation.id}
                    onApprove={() =>
                      updateReservation(reservation.id, { status: "approved" })
                    }
                    onReject={() =>
                      updateReservation(reservation.id, { status: "rejected" })
                    }
                    onDepositChange={(value) =>
                      updateReservation(reservation.id, { deposit_paid: value })
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

                {reservationTotalPages > 1 && (
                  <div className="flex flex-col gap-3 rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-semibold text-[#6d5748]">
                      Página {reservationPage} de {reservationTotalPages}
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={reservationPage <= 1 || loadingReservations}
                        onClick={() => setReservationPage((page) => Math.max(1, page - 1))}
                        className="rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Anterior
                      </button>

                      <button
                        type="button"
                        disabled={reservationPage >= reservationTotalPages || loadingReservations}
                        onClick={() =>
                          setReservationPage((page) =>
                            Math.min(reservationTotalPages, page + 1),
                          )
                        }
                        className="rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
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


function ReservationSearchFilters({
  search,
  dateFrom,
  dateTo,
  totalCount,
  loading,
  hasFilters,
  resultLabel,
  ariaContext,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onClear,
}: {
  search: string;
  dateFrom: string;
  dateTo: string;
  totalCount: number;
  loading: boolean;
  hasFilters: boolean;
  resultLabel: string;
  ariaContext: string;
  onSearchChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
}) {
  const rangeText =
    dateFrom && dateTo
      ? `${formatDateForDisplay(dateFrom)} → ${formatDateForDisplay(dateTo)}`
      : dateFrom
        ? `Desde ${formatDateForDisplay(dateFrom)}`
        : dateTo
          ? `Hasta ${formatDateForDisplay(dateTo)}`
          : "";

  return (
    <div className="mt-5">
      <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
            Buscar por cliente
          </span>

          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#8a7667]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Ej: Santiago, Victoria, Rivas..."
              className="input-contact !pl-12"
              aria-label={`Buscar ${ariaContext} por cliente`}
            />
          </div>
        </label>

        <div className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
            Filtrar por rango de fechas
          </span>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a7667]">
                Desde
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => onDateFromChange(event.target.value)}
                className="input-contact"
                aria-label={`Filtrar ${ariaContext} desde`}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a7667]">
                Hasta
              </span>
              <input
                type="date"
                min={dateFrom || undefined}
                value={dateTo}
                onChange={(event) => onDateToChange(event.target.value)}
                className="input-contact"
                aria-label={`Filtrar ${ariaContext} hasta`}
              />
            </label>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-[#6d5748]/75">
            Para un solo día, usá la misma fecha en Desde y Hasta.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-[#6d5748]">
          {loading ? "Actualizando resultados..." : `${totalCount} ${resultLabel}`}
          {search.trim() ? ` · Cliente: “${search.trim()}”` : ""}
          {rangeText ? ` · ${rangeText}` : ""}
        </p>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#dfc8ab] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#2f241e] transition hover:bg-[#fff9f0]"
          >
            <X size={13} />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

function ManualReservationForm({
  form,
  setForm,
  onSubmit,
  calendarMonth,
  onCalendarMonthChange,
  monthBlocks,
  monthReservations,
  disabledRanges,
  loadingMonth,
  manualSlots,
  loadingSlots,
  onApplySlot,
}: {
  form: ManualReservationFormValues;
  setForm: Dispatch<SetStateAction<ManualReservationFormValues>>;
  onSubmit: (event: FormEvent) => void;
  calendarMonth: Date;
  onCalendarMonthChange: (date: Date) => void;
  monthBlocks: ReservationBlock[];
  monthReservations: Reservation[];
  disabledRanges: DisabledReservationDateRange[];
  loadingMonth: boolean;
  manualSlots: ReservationSlot[];
  loadingSlots: boolean;
  onApplySlot: (slot: ReservationSlot) => void;
}) {
  const deposit = parseOptionalCurrency(form.deposit_amount);
  const depositPreview = Number.isNaN(deposit) ? 0 : Number(deposit ?? 0);

  const sectionClass =
    "rounded-[1.2rem] border border-[#dfc8ab] bg-white/35 p-4 sm:p-5";
  const sectionTitleClass =
    "text-xs font-bold uppercase tracking-[0.16em] text-[#087d75]";
  const fieldLabelClass =
    "mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]";

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-5">
      <section className={sectionClass}>
        <div className="mb-4 border-b border-[#ead9c0] pb-3">
          <p className={sectionTitleClass}>Cliente</p>
          <p className="mt-1 text-xs text-[#8a7667]">Datos de contacto y origen de la consulta.</p>
        </div>

        <div className="grid gap-4">
          <label>
            <span className={fieldLabelClass}>Nombre y apellido</span>
            <input
              value={form.customer_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, customer_name: event.target.value }))
              }
              className="input-contact"
              placeholder="Nombre y apellido"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={fieldLabelClass}>Teléfono</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="input-contact"
                placeholder="+598..."
              />
            </label>

            <label>
              <span className={fieldLabelClass}>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="input-contact"
                placeholder="cliente@email.com"
              />
            </label>
          </div>

          <label>
            <span className={fieldLabelClass}>Cómo conoció Calypso</span>
            <select
              value={form.discovery_source}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, discovery_source: event.target.value }))
              }
              className="input-contact"
            >
              <option value="">No indicado</option>
              {DISCOVERY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-4 border-b border-[#ead9c0] pb-3">
          <p className={sectionTitleClass}>Evento</p>
          <p className="mt-1 text-xs text-[#8a7667]">Tipo de evento, invitados y personal.</p>
        </div>

        <div className="grid gap-4">
          <label>
            <span className={fieldLabelClass}>Tipo de evento</span>
            <select
              value={form.event_type}
              onChange={(event) => setForm((prev) => ({ ...prev, event_type: event.target.value }))}
              className="input-contact"
            >
              <option value="">Seleccioná una opción</option>
              {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={fieldLabelClass}>Cantidad de niños</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={form.children_count}
                onChange={(event) => setForm((prev) => ({ ...prev, children_count: event.target.value }))}
                className="input-contact"
                placeholder="Ej: 15"
              />
            </label>

            <label>
              <span className={fieldLabelClass}>Cantidad de adultos</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={form.adults_count}
                onChange={(event) => setForm((prev) => ({ ...prev, adults_count: event.target.value }))}
                className="input-contact"
                placeholder="Ej: 40"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={fieldLabelClass}>Cantidad de mozos</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.waiters_count}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, waiters_count: event.target.value }))
                }
                className="input-contact"
                placeholder="Ej: 2"
              />
            </label>

            <label>
              <span className={fieldLabelClass}>Cantidad de animadores</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.animators_count}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, animators_count: event.target.value }))
                }
                className="input-contact"
                placeholder="Ej: 1"
              />
            </label>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-4 flex flex-col gap-3 border-b border-[#ead9c0] pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={sectionTitleClass}>Cobro</p>
            <p className="mt-1 text-xs text-[#8a7667]">Importes administrativos del evento.</p>
          </div>
          <div className="rounded-full border border-[#0BB3A6]/30 bg-[#0BB3A6]/10 px-4 py-2 text-xs font-bold text-[#087d75]">
            Seña registrada: {formatMoney(depositPreview)}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className={fieldLabelClass}>Precio pautado</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={form.agreed_price}
              onChange={(event) => setForm((prev) => ({ ...prev, agreed_price: event.target.value }))}
              className="input-contact"
              placeholder="$"
            />
          </label>

          <label>
            <span className={fieldLabelClass}>Seña</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={form.deposit_amount}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  deposit_amount: event.target.value,
                  deposit_paid: Number(event.target.value) > 0 ? true : prev.deposit_paid,
                }))
              }
              className="input-contact"
              placeholder="$"
            />
          </label>


          <div className="flex items-end">
            <label className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/70 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#2f241e]">
              <input
                type="checkbox"
                checked={form.deposit_paid}
                onChange={(event) => setForm((prev) => ({ ...prev, deposit_paid: event.target.checked }))}
                className="h-3.5 w-3.5 accent-[#0BB3A6]"
              />
              Seña paga
            </label>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-4 border-b border-[#ead9c0] pb-3">
          <p className={sectionTitleClass}>Fecha y horario</p>
          <p className="mt-1 text-xs text-[#8a7667]">Disponibilidad del salón y horario acordado.</p>
        </div>

        <ReservationCalendar
          selectedDate={form.event_date}
          calendarMonth={calendarMonth}
          monthBlocks={monthBlocks}
          monthReservations={monthReservations}
          disabledRanges={disabledRanges}
          loading={loadingMonth}
          minDate={getMinReservationDate()}
          onMonthChange={onCalendarMonthChange}
          onSelectDate={(dateValue) => {
            setForm((prev) => ({ ...prev, event_date: dateValue }));
          }}
        />

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className={fieldLabelClass}>Horarios sugeridos</span>
            {loadingSlots && (
              <span className="text-xs font-semibold text-[#087d75]">Consultando...</span>
            )}
          </div>

          {manualSlots.length === 0 ? (
            <div className="rounded-[1rem] border border-[#dfc8ab] bg-white/55 px-4 py-3 text-sm leading-relaxed text-[#5c473b]">
              No hay horarios sugeridos para esta fecha. Igual podés ingresar un horario libre abajo.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {manualSlots.map((slot) => {
                const active = form.start_time === slot.startTime && form.end_time === slot.endTime;
                return (
                  <button
                    key={`${slot.period}-${slot.startTime}`}
                    type="button"
                    onClick={() => onApplySlot(slot)}
                    className={[
                      "rounded-[1rem] border px-3 py-2 text-left text-sm font-semibold transition",
                      active
                        ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
                        : "border-[#dfc8ab] bg-white/65 text-[#2f241e] hover:bg-white",
                    ].join(" ")}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={fieldLabelClass}>Inicio</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-2][0-9]:[0-5][0-9]"
              maxLength={5}
              placeholder="17:00"
              value={form.start_time}
              onChange={(event) => setForm((prev) => ({ ...prev, start_time: event.target.value }))}
              className="input-contact"
            />
          </label>

          <label>
            <span className={fieldLabelClass}>Fin</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-2][0-9]:[0-5][0-9]"
              maxLength={5}
              placeholder="20:00"
              value={form.end_time}
              onChange={(event) => setForm((prev) => ({ ...prev, end_time: event.target.value }))}
              className="input-contact"
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-4 border-b border-[#ead9c0] pb-3">
          <p className={sectionTitleClass}>Notas</p>
          <p className="mt-1 text-xs text-[#8a7667]">Detalles operativos o acuerdos especiales.</p>
        </div>
        <textarea
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          className="input-contact min-h-36 resize-y leading-relaxed"
          placeholder="Menú, personal requerido, decoración, condiciones especiales..."
        />
      </section>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0BB3A6] px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_42px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94]"
      >
        <Plus size={18} />
        Crear reserva aprobada
      </button>
    </form>
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
  isCompletedView,
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
  isCompletedView: boolean;
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
  const [notesOpen, setNotesOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [clientInfoOpen, setClientInfoOpen] = useState(false);
  const [reservationInfoOpen, setReservationInfoOpen] = useState(() => {
    if (isCompletedView) return false;
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 640px)").matches;
  });

  const totalIncome = getEventTotalIncome(reservation);
  const hasIncomeData =
    reservation.deposit_amount !== null || reservation.settlement_amount !== null;

  const [editDraft, setEditDraft] = useState({
    customer_name: reservation.customer_name,
    event_type: reservation.event_type,
    phone: reservation.phone,
    email: reservation.email || "",
    children_count: String(reservation.children_count ?? ""),
    adults_count: String(reservation.adults_count ?? ""),
    event_date: reservation.event_date,
    start_time: normalizeTime(reservation.start_time),
    end_time: normalizeTime(reservation.end_time),
    status: reservation.status,
    deposit_paid: reservation.deposit_paid,
    agreed_price: String(reservation.agreed_price ?? ""),
    settlement_amount: String(reservation.settlement_amount ?? ""),
    deposit_amount: String(reservation.deposit_amount ?? ""),
    waiters_count: String(reservation.waiters_count ?? ""),
    animators_count: String(reservation.animators_count ?? ""),
    discovery_source: reservation.discovery_source || "",
  });

  useEffect(() => {
    // Los refresh automáticos no deben pisar lo que el usuario está escribiendo.
    if (!notesOpen) {
      setNotesDraft(reservation.notes || "");
    }

    if (!isEditing) {
      setEditDraft({
        customer_name: reservation.customer_name,
        event_type: reservation.event_type,
        phone: reservation.phone,
        email: reservation.email || "",
        children_count: String(reservation.children_count ?? ""),
        adults_count: String(reservation.adults_count ?? ""),
        event_date: reservation.event_date,
        start_time: normalizeTime(reservation.start_time),
        end_time: normalizeTime(reservation.end_time),
        status: reservation.status,
        deposit_paid: reservation.deposit_paid,
        agreed_price: String(reservation.agreed_price ?? ""),
        settlement_amount: String(reservation.settlement_amount ?? ""),
        deposit_amount: String(reservation.deposit_amount ?? ""),
        waiters_count: String(reservation.waiters_count ?? ""),
        animators_count: String(reservation.animators_count ?? ""),
        discovery_source: reservation.discovery_source || "",
      });
      setEditError("");
    }
  }, [reservation, isEditing, notesOpen]);

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

    const childrenCount = Number(editDraft.children_count);
    const adultsCount = Number(editDraft.adults_count);

    if (!editDraft.children_count.trim() || Number.isNaN(childrenCount) || childrenCount < 0) {
      setEditError("Ingresá la cantidad de niños.");
      return;
    }

    if (!Number.isInteger(childrenCount)) {
      setEditError("La cantidad de niños debe ser un número entero.");
      return;
    }

    if (childrenCount > MAX_CHILDREN_COUNT) {
      setEditError(`La cantidad máxima permitida es de ${MAX_CHILDREN_COUNT} niños.`);
      return;
    }

    if (!editDraft.adults_count.trim() || Number.isNaN(adultsCount) || adultsCount < 0) {
      setEditError("Ingresá la cantidad de adultos.");
      return;
    }

    if (!Number.isInteger(adultsCount)) {
      setEditError("La cantidad de adultos debe ser un número entero.");
      return;
    }

    if (adultsCount > MAX_ADULTS_COUNT) {
      setEditError(`La cantidad máxima permitida es de ${MAX_ADULTS_COUNT} adultos.`);
      return;
    }

    if (childrenCount + adultsCount <= 0) {
      setEditError("La cantidad total de invitados debe ser mayor a 0.");
      return;
    }

    const agreedPrice = parseOptionalCurrency(editDraft.agreed_price);
    const settlementAmount = parseOptionalCurrency(editDraft.settlement_amount);
    const depositAmount = parseOptionalCurrency(editDraft.deposit_amount);
    const waitersCount = parseOptionalInteger(editDraft.waiters_count);
    const animatorsCount = parseOptionalInteger(editDraft.animators_count);

    if (Number.isNaN(agreedPrice)) {
      setEditError("El precio pautado debe ser un importe válido.");
      return;
    }

    if (Number.isNaN(settlementAmount)) {
      setEditError("La liquidación debe ser un importe válido.");
      return;
    }

    if (Number.isNaN(depositAmount)) {
      setEditError("La seña debe ser un importe válido.");
      return;
    }

    if (Number.isNaN(waitersCount)) {
      setEditError("La cantidad de mozos debe ser un número entero.");
      return;
    }

    if (Number.isNaN(animatorsCount)) {
      setEditError("La cantidad de animadores debe ser un número entero.");
      return;
    }

    if (!editDraft.event_date.trim()) {
      setEditError("Seleccioná la fecha del evento.");
      return;
    }

    if (
      editDraft.event_date !== reservation.event_date &&
      isDateInDisabledRange(editDraft.event_date, disabledRanges)
    ) {
      setEditError("La nueva fecha seleccionada está inhabilitada.");
      return;
    }

    const startTime = normalizeTime(editDraft.start_time);
    const endTime = normalizeTime(editDraft.end_time);

    if (!isValid24HourTime(startTime) || !isValid24HourTime(endTime)) {
      setEditError("Ingresá inicio y fin en formato 24 horas. Ejemplo: 17:00.");
      return;
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      setEditError("El horario de inicio debe ser anterior al horario de fin.");
      return;
    }

    const updateValues: ReservationUpdateValues = {
      customer_name: editDraft.customer_name.trim(),
      event_type: editDraft.event_type,
      phone: editDraft.phone.trim(),
      email: editDraft.email.trim() || null,
      children_count: childrenCount,
      adults_count: adultsCount,
      event_date: editDraft.event_date,
      start_time: startTime,
      end_time: endTime,
      status: editDraft.status,
      deposit_paid: editDraft.deposit_paid,
      agreed_price: agreedPrice,
      settlement_amount: settlementAmount,
      deposit_amount: depositAmount,
      waiters_count: waitersCount,
      animators_count: animatorsCount,
      discovery_source: editDraft.discovery_source || null,
    };

    // El dato combinado se conserva en reservas antiguas hasta que el usuario
    // cargue al menos uno de los dos campos separados.
    if (waitersCount !== null || animatorsCount !== null) {
      updateValues.staff_count = null;
    }

    const saved = await onSaveDetails(updateValues);

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
      children_count: String(reservation.children_count ?? ""),
      adults_count: String(reservation.adults_count ?? ""),
      event_date: reservation.event_date,
      start_time: normalizeTime(reservation.start_time),
      end_time: normalizeTime(reservation.end_time),
      status: reservation.status,
      deposit_paid: reservation.deposit_paid,
      agreed_price: String(reservation.agreed_price ?? ""),
      settlement_amount: String(reservation.settlement_amount ?? ""),
      deposit_amount: String(reservation.deposit_amount ?? ""),
      waiters_count: String(reservation.waiters_count ?? ""),
      animators_count: String(reservation.animators_count ?? ""),
      discovery_source: reservation.discovery_source || "",
    });
    setEditError("");
    setIsEditing(false);
  }

  return (
    <article
      className={[
        "rounded-[1.45rem] border p-5 shadow-[0_12px_32px_rgba(90,64,50,0.06)]",
        isCompletedView
          ? "border-[#d8c9b9] bg-[#f7f2eb]/88"
          : "border-[#dfc8ab] bg-white/55",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
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

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-display text-2xl text-[#2f241e]">
                {reservation.customer_name}
              </h3>
              {isCompletedView && (
                <p className="mt-1 text-sm font-semibold text-[#6d5748]">
                  {formatDateForDisplay(reservation.event_date)} · {normalizeTime(reservation.start_time)}–{normalizeTime(reservation.end_time)}
                </p>
              )}
            </div>

            {isCompletedView && (
              <div className="w-fit rounded-[1rem] border border-[#2f241e]/10 bg-white/65 px-4 py-2 text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a7667]">Ingreso total</p>
                <p className="mt-0.5 text-base font-bold text-[#2f241e]">
                  {formatMoney(hasIncomeData ? totalIncome : null)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            <details
              open={clientInfoOpen}
              onToggle={(event) => setClientInfoOpen(event.currentTarget.open)}
              className="group rounded-[1rem] border border-[#dfc8ab] bg-[#fff9f0]/72 p-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#087d75] [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  <User size={15} />
                  Información del cliente
                </span>
                <ChevronRight size={16} className="transition group-open:rotate-90" />
              </summary>

              <div className="mt-3 grid gap-1.5 text-sm text-[#5c473b] sm:grid-cols-2">
                <p><b>Nombre:</b> {reservation.customer_name}</p>
                <p><b>Tel:</b> {reservation.phone}</p>
                <p><b>Email:</b> {reservation.email || "No indicado"}</p>
                <p><b>Conoció Calypso por:</b> {reservation.discovery_source || "No indicado"}</p>
              </div>
            </details>

            <details
              open={reservationInfoOpen}
              onToggle={(event) => setReservationInfoOpen(event.currentTarget.open)}
              className="group rounded-[1rem] border border-[#dfc8ab] bg-[#fff9f0]/72 p-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8a5b1f] [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  <CalendarCheck size={15} />
                  Información de la reserva
                </span>
                <ChevronRight size={16} className="transition group-open:rotate-90" />
              </summary>

              <div className="mt-3 grid gap-1.5 text-sm text-[#5c473b] sm:grid-cols-2">
                <p><b>Evento:</b> {reservation.event_type}</p>
                <p><b>Fecha:</b> {formatDateForDisplay(reservation.event_date)}</p>
                <p><b>Horario:</b> {normalizeTime(reservation.start_time)} a {normalizeTime(reservation.end_time)}</p>
                <p><b>Niños:</b> {reservation.children_count ?? "No indicado"}</p>
                <p><b>Adultos:</b> {reservation.adults_count ?? "No indicado"}</p>
                <p><b>Mozos:</b> {reservation.waiters_count ?? "No indicado"}</p>
                <p><b>Animadores:</b> {reservation.animators_count ?? "No indicado"}</p>
                {reservation.staff_count !== null &&
                  reservation.waiters_count === null &&
                  reservation.animators_count === null && (
                    <p className="text-[#8a5b1f]">
                      <b>Personal histórico sin separar:</b> {reservation.staff_count}
                    </p>
                  )}
              </div>
            </details>

            <div className="rounded-[1.05rem] border border-[#0BB3A6]/25 bg-[#0BB3A6]/10 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#087d75]">
                  <WalletCards size={16} />
                  Resumen económico
                </div>

                <label className="inline-flex w-fit items-center gap-2 rounded-full border border-[#0BB3A6]/25 bg-white/75 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.09em] text-[#2f241e]">
                  <input
                    type="checkbox"
                    checked={reservation.deposit_paid}
                    onChange={(event) => onDepositChange(event.target.checked)}
                    className="h-3.5 w-3.5 accent-[#0BB3A6]"
                  />
                  Seña paga
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a7667]">Precio pautado</p>
                  <p className="mt-1 font-semibold text-[#2f241e]">{formatMoney(reservation.agreed_price)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a7667]">Seña</p>
                  <p className="mt-1 font-semibold text-[#2f241e]">{formatMoney(reservation.deposit_amount)}</p>
                </div>
                {(reservation.status === "completed" || reservation.settlement_amount !== null) && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a7667]">Liquidación</p>
                    <p className="mt-1 font-semibold text-[#2f241e]">{formatMoney(reservation.settlement_amount)}</p>
                  </div>
                )}
                <div className="rounded-[0.9rem] bg-white/70 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#087d75]">Ingreso total</p>
                  <p className="mt-1 text-lg font-bold text-[#087d75]">{formatMoney(hasIncomeData ? totalIncome : null)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2 lg:max-w-[230px] lg:justify-end">
          {reservation.status !== "approved" && reservation.status !== "completed" && (
            <button
              onClick={onApprove}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-[#0BB3A6] px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white transition hover:bg-[#099f94] disabled:opacity-60"
            >
              <Check size={15} />
              Aprobar
            </button>
          )}

          <button
            onClick={() => setIsEditing((prev) => !prev)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:opacity-60"
          >
            <Pencil size={15} />
            {isEditing ? "Cerrar" : "Editar"}
          </button>

          <details className="group relative">
            <summary className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full border border-[#dfc8ab] bg-white text-[#2f241e] transition hover:bg-[#fff9f0] [&::-webkit-details-marker]:hidden" aria-label="Más acciones">
              <MoreHorizontal size={17} />
            </summary>

            <div className="absolute right-0 z-30 mt-2 min-w-40 rounded-[1rem] border border-[#dfc8ab] bg-[#fffdf9] p-2 shadow-[0_18px_42px_rgba(90,64,50,0.16)]">
              {reservation.status !== "rejected" && reservation.status !== "completed" && (
                <button
                  type="button"
                  onClick={onReject}
                  disabled={loading}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                >
                  <X size={14} />
                  Rechazar
                </button>
              )}

              <button
                type="button"
                onClick={onDelete}
                disabled={loading}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Borrar
              </button>
            </div>
          </details>
        </div>
      </div>

      {isEditing && (
        <form
          onSubmit={handleSaveDetails}
          className="mt-5 rounded-[1.2rem] border border-[#dfc8ab] bg-[#fff9f0]/72 p-4"
        >
          <div className="grid gap-5">
            <section>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#087d75]">Cliente</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Nombre</span>
                  <input value={editDraft.customer_name} onChange={(event) => setEditDraft((prev) => ({ ...prev, customer_name: event.target.value }))} className="input-contact" placeholder="Nombre y apellido" />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Teléfono</span>
                  <input value={editDraft.phone} onChange={(event) => setEditDraft((prev) => ({ ...prev, phone: event.target.value }))} className="input-contact" placeholder="+598..." />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Email</span>
                  <input type="email" value={editDraft.email} onChange={(event) => setEditDraft((prev) => ({ ...prev, email: event.target.value }))} className="input-contact" placeholder="cliente@email.com" />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Cómo conoció Calypso</span>
                  <select value={editDraft.discovery_source} onChange={(event) => setEditDraft((prev) => ({ ...prev, discovery_source: event.target.value }))} className="input-contact">
                    <option value="">No indicado</option>
                    {DISCOVERY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            </section>

            <section className="border-t border-[#ead9c0] pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8a5b1f]">Evento</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Tipo de evento</span>
                  <select value={editDraft.event_type} onChange={(event) => setEditDraft((prev) => ({ ...prev, event_type: event.target.value }))} className="input-contact">
                    <option value="">Seleccioná una opción</option>
                    {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Estado</span>
                  <select value={editDraft.status} onChange={(event) => setEditDraft((prev) => ({ ...prev, status: event.target.value as ReservationStatus }))} className="input-contact">
                    {(["pending", "approved", "rejected", "expired", "completed"] as ReservationStatus[]).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Niños</span>
                  <input type="number" min="0" inputMode="numeric" value={editDraft.children_count} onChange={(event) => setEditDraft((prev) => ({ ...prev, children_count: event.target.value }))} className="input-contact" />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Adultos</span>
                  <input type="number" min="0" inputMode="numeric" value={editDraft.adults_count} onChange={(event) => setEditDraft((prev) => ({ ...prev, adults_count: event.target.value }))} className="input-contact" />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Mozos</span>
                  <input type="number" min="0" step="1" inputMode="numeric" value={editDraft.waiters_count} onChange={(event) => setEditDraft((prev) => ({ ...prev, waiters_count: event.target.value }))} className="input-contact" />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Animadores</span>
                  <input type="number" min="0" step="1" inputMode="numeric" value={editDraft.animators_count} onChange={(event) => setEditDraft((prev) => ({ ...prev, animators_count: event.target.value }))} className="input-contact" />
                </label>
              </div>
            </section>

            <section className="border-t border-[#ead9c0] pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8a5b1f]">Fecha y horario</p>
              <div className="grid gap-4 md:grid-cols-3">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Fecha</span>
                  <input type="date" value={editDraft.event_date} onChange={(event) => setEditDraft((prev) => ({ ...prev, event_date: event.target.value }))} className="input-contact" />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Inicio</span>
                  <input type="text" inputMode="numeric" pattern="[0-2][0-9]:[0-5][0-9]" maxLength={5} value={editDraft.start_time} onChange={(event) => setEditDraft((prev) => ({ ...prev, start_time: event.target.value }))} className="input-contact" placeholder="17:00" />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Fin</span>
                  <input type="text" inputMode="numeric" pattern="[0-2][0-9]:[0-5][0-9]" maxLength={5} value={editDraft.end_time} onChange={(event) => setEditDraft((prev) => ({ ...prev, end_time: event.target.value }))} className="input-contact" placeholder="20:00" />
                </label>
              </div>
            </section>

            <section className="border-t border-[#ead9c0] pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#087d75]">Cobro</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Precio pautado</span>
                  <input type="number" min="0" step="1" inputMode="decimal" value={editDraft.agreed_price} onChange={(event) => setEditDraft((prev) => ({ ...prev, agreed_price: event.target.value }))} className="input-contact" placeholder="$" />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Seña</span>
                  <input type="number" min="0" step="1" inputMode="decimal" value={editDraft.deposit_amount} onChange={(event) => setEditDraft((prev) => ({ ...prev, deposit_amount: event.target.value, deposit_paid: Number(event.target.value) > 0 ? true : prev.deposit_paid }))} className="input-contact" placeholder="$" />
                </label>
                {reservation.status === "completed" && (
                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">Liquidación</span>
                    <input type="number" min="0" step="1" inputMode="decimal" value={editDraft.settlement_amount} onChange={(event) => setEditDraft((prev) => ({ ...prev, settlement_amount: event.target.value }))} className="input-contact" placeholder="$" />
                  </label>
                )}
                <div className="flex items-end">
                  <label className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/70 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#2f241e]">
                    <input type="checkbox" checked={editDraft.deposit_paid} onChange={(event) => setEditDraft((prev) => ({ ...prev, deposit_paid: event.target.checked }))} className="h-3.5 w-3.5 accent-[#0BB3A6]" />
                    Seña paga
                  </label>
                </div>
              </div>
            </section>
          </div>

          {editError && (
            <p className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {editError}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-[#0BB3A6] px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white transition hover:bg-[#099f94] disabled:opacity-60">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Guardar cambios
            </button>
            <button type="button" onClick={cancelEdit} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:opacity-60">
              <X size={15} />
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 rounded-[1.2rem] border border-[#dfc8ab] bg-[#fff9f0]/72 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
              <StickyNote size={15} />
              Notas internas
            </p>
            {!notesOpen && (
              <p className="mt-2 max-h-[4.5rem] overflow-hidden whitespace-pre-wrap text-sm leading-6 text-[#5c473b]">
                {reservation.notes?.trim() || "Sin notas internas todavía."}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setNotesOpen((prev) => !prev)}
            className="shrink-0 rounded-full border border-[#dfc8ab] bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#2f241e] transition hover:bg-white"
          >
            {notesOpen ? "Cerrar" : reservation.notes?.trim() ? "Ver / editar" : "Agregar nota"}
          </button>
        </div>

        {notesOpen && (
          <div className="mt-4 border-t border-[#ead9c0] pt-4">
            <textarea
              value={notesDraft}
              onChange={(event) => setNotesDraft(event.target.value)}
              className="input-contact min-h-48 resize-y leading-relaxed"
              placeholder="Notas internas: menú, personal requerido, detalles, decoración, condiciones especiales..."
            />

            <button
              type="button"
              onClick={() => onSaveNotes(notesDraft)}
              disabled={loading}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-white disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Guardar notas
            </button>
          </div>
        )}
      </div>
    </article>
  );
}


function ReservationCalendar({
  selectedDate,
  calendarMonth,
  monthBlocks,
  monthReservations,
  disabledRanges,
  loading,
  minDate,
  onMonthChange,
  onSelectDate,
}: {
  selectedDate: string;
  calendarMonth: Date;
  monthBlocks: ReservationBlock[];
  monthReservations: Reservation[];
  disabledRanges: DisabledReservationDateRange[];
  loading: boolean;
  minDate: string;
  onMonthChange: (date: Date) => void;
  onSelectDate: (dateValue: string) => void;
}) {
  const days = getCalendarDays(calendarMonth);
  const month = calendarMonth.getMonth();
  const weekDays = ["D", "L", "M", "M", "J", "V", "S"];

  const getDateReservations = (dateValue: string) =>
    monthReservations.filter((reservation) => reservation.event_date === dateValue);

  const getDateTooltip = (dateValue: string) => {
    if (dateValue < minDate) {
      return "No disponible";
    }

    const disabledRange = getDisabledRangeForDate(dateValue, disabledRanges);

    if (disabledRange) {
      return `Inhabilitada: ${disabledRange.reason?.trim() || "sin motivo indicado"}`;
    }

    const dateReservations = getDateReservations(dateValue);

    if (dateReservations.length === 0) {
      return "Libre";
    }

    return dateReservations
      .slice(0, 4)
      .map(
        (reservation) =>
          `${reservation.customer_name} - ${normalizeTime(reservation.start_time)} a ${normalizeTime(
            reservation.end_time,
          )} (${statusLabels[reservation.status]})`,
      )
      .join("\n");
  };

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
          const tooltip = getDateTooltip(dateValue);
          const dateReservations = getDateReservations(dateValue);
          const hasReservation = dateReservations.length > 0;
          const isClosed = availability === "closed";

          const selected = selectedDate === dateValue && availability !== "closed";
          const outsideMonth = date.getMonth() !== month;
          const disabled = availability === "disabled" || availability === "closed";

          return (
            <button
              key={dateValue}
              type="button"
              disabled={disabled}
              title={tooltip}
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
              <span>{date.getDate()}</span>

              {(isClosed || hasReservation) && (
                <span className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
                  {isClosed && <span className="h-1.5 w-1.5 rounded-full bg-red-700" />}
                  {hasReservation && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2f241e]" />
                  )}
                </span>
              )}
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
Inhabilitada / completo
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-stone-200 ring-1 ring-stone-300" />
No disponible / fuera de rango
        </div>
      </div>
    </div>
  );
}