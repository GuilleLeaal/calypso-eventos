import { MAX_ADULTS_COUNT, MAX_CHILDREN_COUNT } from "../constants";
import { parseOptionalCurrency, parseOptionalInteger } from "./exportHelpers";
import { isValid24HourTime, normalizeTime, timeToMinutes } from "./timeHelpers";

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function validateContactAndGuests(values: {
  customer_name: string;
  event_type: string;
  phone: string;
  children_count: string;
  adults_count: string;
}): ValidationResult<{ childrenCount: number; adultsCount: number }> {
  if (!values.customer_name.trim()) {
    return { ok: false, error: "Ingresá el nombre del cliente." };
  }

  if (!values.event_type.trim()) {
    return { ok: false, error: "Seleccioná el tipo de evento." };
  }

  if (!values.phone.trim()) {
    return { ok: false, error: "Ingresá el teléfono." };
  }

  const childrenCount = Number(values.children_count);
  const adultsCount = Number(values.adults_count);

  if (
    !values.children_count.trim() ||
    Number.isNaN(childrenCount) ||
    childrenCount < 0
  ) {
    return { ok: false, error: "Ingresá la cantidad de niños." };
  }

  if (!Number.isInteger(childrenCount)) {
    return {
      ok: false,
      error: "La cantidad de niños debe ser un número entero.",
    };
  }

  if (childrenCount > MAX_CHILDREN_COUNT) {
    return {
      ok: false,
      error: `La cantidad máxima permitida es de ${MAX_CHILDREN_COUNT} niños.`,
    };
  }

  if (
    !values.adults_count.trim() ||
    Number.isNaN(adultsCount) ||
    adultsCount < 0
  ) {
    return { ok: false, error: "Ingresá la cantidad de adultos." };
  }

  if (!Number.isInteger(adultsCount)) {
    return {
      ok: false,
      error: "La cantidad de adultos debe ser un número entero.",
    };
  }

  if (adultsCount > MAX_ADULTS_COUNT) {
    return {
      ok: false,
      error: `La cantidad máxima permitida es de ${MAX_ADULTS_COUNT} adultos.`,
    };
  }

  if (childrenCount + adultsCount <= 0) {
    return {
      ok: false,
      error: "La cantidad total de invitados debe ser mayor a 0.",
    };
  }

  return { ok: true, value: { childrenCount, adultsCount } };
}

// La liquidación solo se valida cuando se pasa (edición); la creación manual no la carga.
export function parseReservationAmounts(values: {
  agreed_price: string;
  settlement_amount?: string;
  deposit_amount: string;
  waiters_count: string;
  animators_count: string;
}): ValidationResult<{
  agreedPrice: number | null;
  settlementAmount: number | null;
  depositAmount: number | null;
  waitersCount: number | null;
  animatorsCount: number | null;
}> {
  const agreedPrice = parseOptionalCurrency(values.agreed_price);
  const settlementAmount =
    values.settlement_amount === undefined
      ? null
      : parseOptionalCurrency(values.settlement_amount);
  const depositAmount = parseOptionalCurrency(values.deposit_amount);
  const waitersCount = parseOptionalInteger(values.waiters_count);
  const animatorsCount = parseOptionalInteger(values.animators_count);

  if (Number.isNaN(agreedPrice)) {
    return { ok: false, error: "El precio pautado debe ser un importe válido." };
  }

  if (Number.isNaN(settlementAmount)) {
    return { ok: false, error: "La liquidación debe ser un importe válido." };
  }

  if (Number.isNaN(depositAmount)) {
    return { ok: false, error: "La seña debe ser un importe válido." };
  }

  if (Number.isNaN(waitersCount)) {
    return {
      ok: false,
      error: "La cantidad de mozos debe ser un número entero.",
    };
  }

  if (Number.isNaN(animatorsCount)) {
    return {
      ok: false,
      error: "La cantidad de animadores debe ser un número entero.",
    };
  }

  return {
    ok: true,
    value: {
      agreedPrice,
      settlementAmount,
      depositAmount,
      waitersCount,
      animatorsCount,
    },
  };
}

export function validateReservationTimes(
  rawStartTime: string,
  rawEndTime: string,
): ValidationResult<{ startTime: string; endTime: string }> {
  const startTime = normalizeTime(rawStartTime);
  const endTime = normalizeTime(rawEndTime);

  if (!isValid24HourTime(startTime) || !isValid24HourTime(endTime)) {
    return {
      ok: false,
      error: "Ingresá inicio y fin en formato 24 horas. Ejemplo: 17:00.",
    };
  }

  if (timeToMinutes(startTime) === timeToMinutes(endTime)) {
    return {
      ok: false,
      error: "El horario de inicio y fin no pueden ser iguales.",
    };
  }

  return { ok: true, value: { startTime, endTime } };
}
