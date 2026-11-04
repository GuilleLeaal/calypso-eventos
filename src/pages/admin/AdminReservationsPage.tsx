import "./admin.css";
import { useState } from "react";
import { CalendarCheck, Loader2, Plus } from "lucide-react";
import type { AdminSection } from "./types";
import { RESERVATIONS_PER_PAGE, statusLabels } from "./constants";
import { AdminLoginScreen } from "./components/AdminLoginScreen";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSectionTabs } from "./components/AdminSectionTabs";
import { AvailabilityCalendarSection } from "./components/AvailabilityCalendarSection";
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
  const [calendarRefresh, setCalendarRefresh] = useState(0);
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
    creatingReview,
    createApprovedReview,
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

  const {
    handleSaveDisabledRange,
    deleteDisabledRange,
    editingRange,
    saveError,
    startEditingRange,
    cancelEditingRange,
  } = useDisabledRangeActions({
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
    if (activeSection === "calendar") {
      setCalendarRefresh((value) => value + 1);
      return;
    }
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
      <main className="admin-shell grid min-h-[100svh] place-items-center bg-paper pt-28">
        <Loader2 className="h-8 w-8 animate-spin text-calypso-700" />
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
    <main className="admin-shell relative min-h-[100svh] bg-paper pt-28 font-texto text-ink lg:pt-32">


      <section className="relative mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-10">
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
          <p role="alert" className="mt-7 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {globalError}
          </p>
        )}

        {activeSection === "calendar" && (
          <AvailabilityCalendarSection refreshKey={calendarRefresh} />
        )}

        {activeSection === "reservations" && (
          <div className="mt-6 space-y-6">
            <details className="group rounded-xl border border-calypso-700/25 bg-white/60 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl p-5 transition hover:bg-white/60 sm:px-6 [&::-webkit-details-marker]:hidden">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-calypso-700 text-white">
                    <Plus size={20} className="transition-transform group-open:rotate-45" />
                  </span>
                  <div>
                    <h2 className="font-titular text-2xl text-ink">Crear reserva</h2>
                    <p className="mt-1 text-sm text-ink-mute">Consultá el calendario y registrá reservas recibidas por fuera de la web.</p>
                  </div>
                </div>
                <span className="hidden text-sm font-semibold text-calypso-700 sm:block group-open:hidden">Abrir formulario</span>
                <span className="hidden text-sm font-semibold text-calypso-700 sm:group-open:block">Cerrar</span>
              </summary>
              <div className="border-t border-ink/10 px-4 pb-6 sm:px-6">
                <ManualReservationForm {...manualReservationFormProps} />
              </div>
            </details>

            <section className="rounded-xl border border-[#D8D2C5] bg-white/70 p-6 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[#D8D2C5] pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-titular font-normal text-3xl text-[#1C1915]">
                    Reservas
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#4B443B]">
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
                      aria-pressed={filter === item}
                      onClick={() => {
                        setFilter(item);
                        setReservationPage(1);
                      }}
                      className={[
                        "rounded-md border px-4 py-2 text-xs font-semibold transition",
                        filter === item
                          ? "border-calypso-700 bg-calypso-700 text-white"
                          : "border-[#D8D2C5] bg-white/50 text-[#4B443B] hover:bg-white",
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
          <section className="mt-6 rounded-xl border border-[#D8D2C5] bg-white/70 p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-[#D8D2C5] pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#1C1915]">
                  <CalendarCheck size={20} />
                  <h2 className="font-titular font-normal text-3xl">Eventos finalizados</h2>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4B443B]">
                  Historial de eventos cuyo horario ya terminó. Se muestran
                  primero los más recientes. El estado se sincroniza
                  automáticamente mientras el panel permanece abierto.
                </p>
              </div>

              <span className="w-fit rounded-full border border-[#1C1915]/15 bg-[#1C1915]/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1C1915]">
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
            editingRange={editingRange}
            saveError={saveError}
            onEdit={startEditingRange}
            onCancelEdit={cancelEditingRange}
            onSave={handleSaveDisabledRange}
            onDelete={deleteDisabledRange}
          />
        )}

        {activeSection === "reviews" && (
          <ReviewsAdminSection
            creatingReview={creatingReview}
            onCreate={createApprovedReview}
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
