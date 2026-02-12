/**
 * Chart Tooltip Component
 * Enhanced tooltip for Recharts with consistent styling
 * @module components/analytics/ChartTooltip
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface TooltipItem {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    dataKey: string;
    payload: Record<string, unknown>;
  }>;
  label?: string;
  title?: string;
  formatter?: (value: number, name: string, dataKey: string) => string;
  labelFormatter?: (label: string) => string;
  additionalItems?: TooltipItem[];
  className?: string;
  footer?: React.ReactNode;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format number as currency
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// ============================================================================
// Chart Tooltip Component
// ============================================================================

export function ChartTooltip({
  active,
  payload,
  label,
  title,
  formatter,
  labelFormatter,
  additionalItems,
  className,
  footer,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formattedLabel = labelFormatter ? labelFormatter(label || '') : label;

  return (
    <div
      className={cn(
        'bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-2xl',
        'min-w-[180px] max-w-[280px]',
        className
      )}
      role="tooltip"
      aria-label={`Tooltip for ${formattedLabel || 'data point'}`}
    >
      {/* Title / Label */}
      {formattedLabel && (
        <p className="text-slate-200 font-semibold mb-2 pb-2 border-b border-slate-800">
          {title || formattedLabel}
        </p>
      )}

      {/* Main Payload Items */}
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const formattedValue = formatter
            ? formatter(entry.value, entry.name, entry.dataKey)
            : formatNumber(entry.value);

          return (
            <div
              key={`tooltip-item-${index}`}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                  aria-hidden="true"
                />
                <span className="text-slate-400 truncate">{entry.name}</span>
              </div>
              <span className="text-slate-200 font-medium tabular-nums flex-shrink-0">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>

      {/* Additional Items */}
      {additionalItems && additionalItems.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
          {additionalItems.map((item, index) => (
            <div
              key={`additional-${index}`}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.icon && (
                  <span className="text-slate-500 flex-shrink-0">{item.icon}</span>
                )}
                {!item.icon && item.color && (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                )}
                <span className="text-slate-400 truncate">{item.label}</span>
              </div>
              <span className="text-slate-200 font-medium tabular-nums flex-shrink-0">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="mt-2 pt-2 border-t border-slate-800">{footer}</div>
      )}
    </div>
  );
}

// ============================================================================
// Specialized Tooltip Presets
// ============================================================================

/**
 * Revenue Tooltip with currency formatting
 */
export function RevenueTooltip({
  active,
  payload,
  label,
}: Omit<ChartTooltipProps, 'formatter'>) {
  const formatter = (value: number, name: string, dataKey: string) => {
    if (dataKey === 'revenue' || dataKey === 'avgValue') {
      return formatCurrency(value);
    }
    return formatNumber(value);
  };

  return (
    <ChartTooltip
      active={active}
      payload={payload}
      label={label}
      formatter={formatter}
    />
  );
}

/**
 * Conversion Tooltip with percentage formatting
 */
export function ConversionTooltip({
  active,
  payload,
  label,
}: Omit<ChartTooltipProps, 'formatter'>) {
  const formatter = (value: number, name: string) => {
    if (name === 'Conversion Rate') {
      return formatPercent(value);
    }
    return formatNumber(value);
  };

  return (
    <ChartTooltip
      active={active}
      payload={payload}
      label={label}
      formatter={formatter}
    />
  );
}

export default ChartTooltip;
