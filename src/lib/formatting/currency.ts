export function formatCurrency(value: number | string | null | undefined, currency = 'BRL') {
  const numericValue = Number(value ?? 0);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}
