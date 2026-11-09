export type DisabledRangeValues = { start_date: string; end_date: string; reason: string };

function isDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateDisabledRange(values: DisabledRangeValues, minDate: string, originalStart?: string) {
  if (!isDate(values.start_date) || !isDate(values.end_date)) return "Seleccioná fecha de inicio y fecha de fin válidas.";
  // An ongoing range may have started in the past; allow retaining that start.
  if (values.start_date < minDate && values.start_date !== originalStart) return "No se pueden inhabilitar fechas anteriores a la fecha mínima.";
  if (values.end_date < values.start_date) return "La fecha de fin no puede ser anterior a la fecha de inicio.";
  return "";
}
