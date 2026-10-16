import { useState } from "react";
import { CalendarCheck, Loader2, Plus } from "lucide-react";
import type { AdminSection } from "./types";
import { RESERVATIONS_PER_PAGE, statusLabels } from "./constants";
import { AdminLoginScreen } from "./components/AdminLoginScreen";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSectionTabs } from "./components/AdminSectionTabs";
import { ReservationSearchFilters } from "./components/ReservationSearchFilters";
import { ReservationListResults } from "./components/ReservationListResults";
import { DisabledDatesAdminSection } from "./components/DisabledDatesAdminSection";
import { ReviewsAdminSection } from "./components/ReviewsAdminSection";
import { ManualReservationForm } from "./components/ManualReservationForm";
import { useAdminSession } from "./hooks/useAdminSession";
import { useDisabledRanges } from "./hooks/useDisabledRanges";
import { useReviews } from "./hooks/useReviews";
import { useManualReservationCalendar } from "./hooks/useManualReservationCalendar";
import { useReservationsList } from "./hooks/useReservationsList";
import { useReservationActions } from "./hooks/useReservationActions";
import { useDisabledRangeActions } from "./hooks/useDisabledRangeActions";
import { useAdminExports } from "./hooks/useAdminExports";

export default function AdminReservationsPage() {
  const {
    sessionReady,
    isLoggedIn,
    loginForm,
    setLoginForm,
    loginLoading,
    loginError,
    handleLogin,
    handleLogout,
  } = useAdminSession(clearSessionData);

  const [globalError, setGlobalError] = useState("");
  const [activeSection, setActiveSection] =
    useState<AdminSection>("reservations");

  const {
    disabledRanges,
    setDisabledRanges,
    loadingDisabledRanges,
    disabledActionLoadingId,
    setDisabledActionLoadingId,
    disabledForm,
    setDisabledForm,
    fetchDisabledRanges,
  } = useDisabledRanges({ isLoggedIn, setGlobalError });

  const {
    reviews,
    setReviews,
    loadingReviews,
    reviewActionLoadingId,
    reviewFilter,
    setReviewFilter,
    fetchReviews,
    updateReviewStatus,
    deleteReview,
  } = useReviews({ isLoggedIn, activeSection, setGlobalError });

  const {
    setManualBlocks,
    manualMonthBlocks,
    setManualMonthBlocks,
    manualMonthReservations,
    setManualMonthReservations,
    loadingManualSlots,
    loadingManualMonthBlocks,
    manualCalendarMonth,
    setManualCalendarMonth,
    manualForm,
    setManualForm,
    manualSlots,
    fetchManualBlocks,
    fetchManualMonthBlocks,
    applyManualSlot,
  } = useManualReservationCalendar({
    isLoggedIn,
    activeSection,
    disabledRanges,
  });

  const {
    reservations,
    setReservations,
    reservationPage,
    setReservationPage,
    reservationTotalCount,
    reservationSearch,
    setReservationSearch,
    reservationDateFromFilter,
    setReservationDateFromFilter,
    reservationDateToFilter,
    setReservationDateToFilter,
    loadingReservations,
    filter,
    setFilter,
    reservationTotalPages,
    reservationFirstItem,
    reservationLastItem,
    hasReservationFilters,
    clearReservationFilters,
    fetchReservations,
  } = useReservationsList({ isLoggedIn, activeSection, setGlobalError });

  const {
    actionLoadingId,
    creatingReservation,
    updateReservation,
    updateReservationStatus,
    updateReservationDetails,
    deleteReservation,
    handleCreateManualReservation,
  } = useReservationActions({
    setGlobalError,
    disabledRanges,
    manualForm,
    setManualForm,
    setManualCalendarMonth,
    fetchReservations,
    fetchManualBlocks,
    fetchManualMonthBlocks,
  });

  const { handleCreateDisabledRange, deleteDisabledRange } =
    useDisabledRangeActions({
      disabledForm,
      setDisabledForm,
      setDisabledActionLoadingId,
      setGlobalError,
      setManualForm,
      fetchDisabledRanges,
      fetchManualBlocks,
      fetchManualMonthBlocks,
    });

  const { downloadClientsExcel, downloadEventsExcel } = useAdminExports({
    setGlobalError,
    fetchReservations,
  });

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

  function clearSessionData() {
    setReservations([]);
    setReviews([]);
    setDisabledRanges([]);
    setManualBlocks([]);
    setManualMonthBlocks([]);
    setManualMonthReservations([]);
  }

  function handleSectionChange(section: AdminSection) {
    setActiveSection(section);

    if (section === "reservations" || section === "completed_events") {
      setReservationPage(1);
    }
  }

  function handleSearchChange(value: string) {
    setReservationSearch(value);
    setReservationPage(1);
  }

  function handleDateFromChange(value: string) {
    setReservationDateFromFilter(value);
    setReservationDateToFilter((currentTo) =>
      currentTo && value && currentTo < value ? value : currentTo,
    );
    setReservationPage(1);
  }

  function handleDateToChange(value: string) {
    setReservationDateToFilter(value);
    setReservationPage(1);
  }

  const hasSearchOrDateFilter = Boolean(
    reservationSearch.trim() ||
    reservationDateFromFilter ||
    reservationDateToFilter,
  );

  const manualReservationFormProps = {
    form: manualForm,
    setForm: setManualForm,
    onSubmit: handleCreateManualReservation,
    creating: creatingReservation,
    calendarMonth: manualCalendarMonth,
    onCalendarMonthChange: setManualCalendarMonth,
    monthBlocks: manualMonthBlocks,
    monthReservations: manualMonthReservations,
    disabledRanges,
    loadingMonth: loadingManualMonthBlocks,
    manualSlots,
    loadingSlots: loadingManualSlots,
    onApplySlot: applyManualSlot,
  };

  const reservationListProps = {
    reservations,
    loading: loadingReservations,
    firstItem: reservationFirstItem,
    lastItem: reservationLastItem,
    totalCount: reservationTotalCount,
    page: reservationPage,
    totalPages: reservationTotalPages,
    setPage: setReservationPage,
    disabledRanges,
    actionLoadingId,
    onUpdateStatus: updateReservationStatus,
    onUpdate: updateReservation,
    onUpdateDetails: updateReservationDetails,
    onDelete: deleteReservation,
  };

  const reservationSearchFilterProps = {
    search: reservationSearch,
    dateFrom: reservationDateFromFilter,
    dateTo: reservationDateToFilter,
    totalCount: reservationTotalCount,
    loading: loadingReservations,
    hasFilters: hasReservationFilters,
    onSearchChange: handleSearchChange,
    onDateFromChange: handleDateFromChange,
    onDateToChange: handleDateToChange,
    onClear: clearReservationFilters,
  };

  if (!sessionReady) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-[#f6f0e7] pt-28">
        <Loader2 className="h-8 w-8 animate-spin text-[#0BB3A6]" />
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <AdminLoginScreen
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        loginLoading={loginLoading}
        loginError={loginError}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-x-clip bg-[#f6f0e7] pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-130px] top-[-120px] h-80 w-80 rounded-full bg-[#0BB3A6]/12 blur-3xl" />
        <div className="absolute right-[-140px] bottom-[-130px] h-96 w-96 rounded-full bg-[#e8c17f]/14 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <AdminHeader
          onDownloadClients={downloadClientsExcel}
          onDownloadEvents={downloadEventsExcel}
          onRefresh={refreshAll}
          onLogout={handleLogout}
        />

        <AdminSectionTabs
          activeSection={activeSection}
          onSelect={handleSectionChange}
        />

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
                    Tocalo solo si necesitás cargar una reserva desde el
                    celular.
                  </p>
                </div>

                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/12 text-[#0BB3A6] transition group-open:rotate-45">
                  <Plus size={18} />
                </span>
              </summary>

              <div className="mt-5 border-t border-[#e4cfad] pt-5">
                <ManualReservationForm {...manualReservationFormProps} />
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

              <ManualReservationForm {...manualReservationFormProps} />
            </section>

            <section className="rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur">
              <div className="flex flex-col gap-4 border-b border-[#e4cfad] pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-display text-3xl text-[#2f241e]">
                    Reservas
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
                    Pendientes, aprobadas, rechazadas y vencidas. Cuando termina
                    el horario del evento, pasa automáticamente a Eventos
                    finalizados. La lista carga de a {RESERVATIONS_PER_PAGE}.
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
                {...reservationSearchFilterProps}
                resultLabel="reservas"
                ariaContext="reservas"
              />

              <ReservationListResults
                {...reservationListProps}
                isCompletedView={false}
                emptyMessage={
                  hasSearchOrDateFilter
                    ? "No hay reservas para esa búsqueda o rango de fechas."
                    : "No hay reservas para este filtro."
                }
              />
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
                  Historial de eventos cuyo horario ya terminó. Se muestran
                  primero los más recientes. El estado se sincroniza
                  automáticamente mientras el panel permanece abierto.
                </p>
              </div>

              <span className="w-fit rounded-full border border-[#2f241e]/15 bg-[#2f241e]/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#2f241e]">
                {reservationTotalCount} finalizado
                {reservationTotalCount === 1 ? "" : "s"}
              </span>
            </div>

            <ReservationSearchFilters
              {...reservationSearchFilterProps}
              resultLabel="eventos finalizados"
              ariaContext="eventos finalizados"
            />

            <ReservationListResults
              {...reservationListProps}
              isCompletedView
              emptyMessage={
                hasSearchOrDateFilter
                  ? "No hay eventos finalizados para esa búsqueda o rango de fechas."
                  : "Todavía no hay eventos finalizados."
              }
            />
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
