import { EXPORT_BATCH_SIZE } from "../constants";
import type { Reservation } from "../types";

type ExcelColumnOptions = {
  index: number;
  numberFormat?: string;
  minWidth?: number;
  maxWidth?: number;
};

export async function downloadExcelFile({
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
    const options = columnOptions.find(
      (item) => item.index === columnIndex + 1,
    );
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

export function normalizeClientIdentityValue(value: string | null | undefined) {
  return (value || "").trim().toLocaleLowerCase("es-UY").replace(/\s+/g, " ");
}

export function getClientExportKey(reservation: Reservation) {
  const phone = (reservation.phone || "").replace(/\D/g, "");
  if (phone) return `phone:${phone}`;

  const email = normalizeClientIdentityValue(reservation.email);
  if (email) return `email:${email}`;

  return `name:${normalizeClientIdentityValue(reservation.customer_name)}`;
}

export function parseOptionalCurrency(value: string) {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) return null;

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) return Number.NaN;

  return Math.round(amount * 100) / 100;
}

export function parseOptionalInteger(value: string) {
  const normalized = value.trim();

  if (!normalized) return null;

  const amount = Number(normalized);

  if (!Number.isInteger(amount) || amount < 0) return Number.NaN;

  return amount;
}

export function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "No indicado";

  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getEventTotalIncome(
  reservation: Pick<Reservation, "deposit_amount" | "settlement_amount">,
) {
  return (
    Number(reservation.deposit_amount ?? 0) +
    Number(reservation.settlement_amount ?? 0)
  );
}

export async function fetchAllReservationPages(
  fetchPage: (from: number, to: number) => Promise<Reservation[]>,
) {
  const reservations: Reservation[] = [];
  let from = 0;

  while (true) {
    const page = await fetchPage(from, from + EXPORT_BATCH_SIZE - 1);

    reservations.push(...page);

    if (page.length < EXPORT_BATCH_SIZE) {
      break;
    }

    from += EXPORT_BATCH_SIZE;
  }

  return reservations;
}
