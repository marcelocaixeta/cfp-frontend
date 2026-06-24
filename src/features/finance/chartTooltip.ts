import type { CSSProperties } from 'react';

export const financeTooltipContentStyle: CSSProperties = {
  background: 'var(--color-surface-muted)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-md)',
  color: 'var(--color-text)',
};

export const financeTooltipLabelStyle: CSSProperties = {
  color: 'var(--color-text)',
  fontWeight: 750,
};

export const financeTooltipItemStyle: CSSProperties = {
  color: 'var(--color-text-muted)',
};

export const financeTooltipCursor = {
  fill: 'var(--color-primary-soft)',
  opacity: 0.7,
};
