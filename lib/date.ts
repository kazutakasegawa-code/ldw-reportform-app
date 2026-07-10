const timeZone = "Asia/Tokyo";

export function formatDateTimeJst(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}

export function formatDateJst(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function formatDateInputJst(date?: Date | null) {
  if (!date) return "";
  const parts = datePartsJst(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatDateTimeInputJst(date?: Date | null) {
  if (!date) return "";
  const parts = datePartsJst(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function parseDateInputAsJst(value?: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00+09:00`);
}

export function parseDateTimeInputAsJst(value?: string | null) {
  if (!value) return null;
  return new Date(`${value}:00+09:00`);
}

function datePartsJst(date: Date) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);

  return {
    year: part(parts, "year"),
    month: part(parts, "month"),
    day: part(parts, "day"),
    hour: part(parts, "hour"),
    minute: part(parts, "minute")
  };
}

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((item) => item.type === type)?.value || "";
}
