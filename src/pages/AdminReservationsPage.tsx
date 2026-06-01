import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { motion, circOut } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Lock,
  LogOut,
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
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "completed";

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
  return value.slice(0, 5);
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
    return getAvailableSlots(manualForm.event_date, manualBlocks);
  }, [manualForm.event_date, manualBlocks]);

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
      } else {
        setReservations([]);
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

  async function refreshAll() {
    await fetchReservations();
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
    values: Partial<
      Pick<Reservation, "status" | "deposit_paid" | "notes" | "updated_at">
    >,
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
    } else {
      await refreshAll();
    }

    setActionLoadingId(null);
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

    const { error } = await supabase.rpc("create_admin_reservation", {
      p_customer_name: manualForm.customer_name,
      p_event_type: manualForm.event_type,
      p_phone: manualForm.phone,
      p_email: manualForm.email,
      p_event_date: manualForm.event_date,
      p_start_time: manualForm.start_time,
      p_end_time: manualForm.end_time,
      p_deposit_paid: manualForm.deposit_paid,
      p_notes: manualForm.notes,
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
              Gestión de{" "}
              <span className="relative inline-block text-[#0BB3A6]">
                reservas
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#0BB3A6] via-[#e8c17f] to-transparent" />
              </span>
              .
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5c473b] md:text-base">
              Administrá solicitudes pendientes, reservas confirmadas, señas,
              notas internas y métricas de origen de clientes.
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

        {globalError && (
          <p className="mt-7 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {globalError}
          </p>
        )}

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
                      Horarios disponibles
                    </span>

                    {loadingManualSlots && (
                      <span className="text-xs font-semibold text-[#087d75]">
                        Consultando...
                      </span>
                    )}
                  </div>

                  {manualSlots.length === 0 ? (
                    <div className="rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 text-sm leading-relaxed text-[#5c473b]">
                      No hay horarios disponibles para esta fecha.
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
                    Se ocultan los horarios que se superponen con reservas
                    aprobadas o pendientes vigentes, respetando la ventana de
                    1:30 h.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Inicio
                    </span>
                    <input
                      type="time"
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
                      type="time"
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
                    loading={actionLoadingId === reservation.id}
                    onApprove={() =>
                      updateReservation(reservation.id, { status: "approved" })
                    }
                    onReject={() =>
                      updateReservation(reservation.id, { status: "rejected" })
                    }
                    onDepositChange={(value) =>
                      updateReservation(reservation.id, {
                        deposit_paid: value,
                      })
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
      </section>
    </main>
  );
}

function ReservationCard({
  reservation,
  loading,
  onApprove,
  onReject,
  onDepositChange,
  onSaveNotes,
  onDelete,
}: {
  reservation: Reservation;
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDepositChange: (value: boolean) => void;
  onSaveNotes: (notes: string) => void;
  onDelete: () => void;
}) {
  const [notesDraft, setNotesDraft] = useState(reservation.notes || "");

  useEffect(() => {
    setNotesDraft(reservation.notes || "");
  }, [reservation.notes]);

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
            {reservation.email && (
              <p>
                <b>Email:</b> {reservation.email}
              </p>
            )}
            {reservation.discovery_source && (
              <p>
                <b>Conoció Calypso por:</b> {reservation.discovery_source}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
  loading,
  minDate,
  onMonthChange,
  onSelectDate,
}: {
  selectedDate: string;
  calendarMonth: Date;
  monthBlocks: ReservationBlock[];
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

          const selected = selectedDate === dateValue;
          const outsideMonth = date.getMonth() !== month;
          const disabled =
            availability === "disabled" || availability === "full";

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
                  : availability === "full"
                    ? "cursor-not-allowed border-red-300 bg-red-100 text-red-700"
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
          Reservada
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-stone-200 ring-1 ring-stone-300" />
          No disponible
        </div>
      </div>
    </div>
  );
}
