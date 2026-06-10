export function formatNumber(value: number | string | null | undefined, maximumFractionDigits = 2) {
  const numericValue = Number(value ?? 0);

  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatBtc(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0);

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}
