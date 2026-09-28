import { useMemo, useState } from "react"
import type { DateRange as DayPickerDateRange } from "react-day-picker"
import {
  calculateOccupancy,
  calculateOverdue,
  calculateProjection,
  calculateRevenue,
  filterData,
  getRecentActivity,
  type DateFilterType,
  type DateRange,
  type TabType,
} from "@/lib/analytics"
import type { ISODate, Lease, Payment, Property } from "@/lib/types"

export type { DateFilterType, TabType }

/** Calendar picks are local dates; keep the day the user clicked. */
function toISO(date: Date): ISODate {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export function useDashboardMetrics(properties: Property[], leases: Lease[], payments: Payment[], today: ISODate) {
  const [dateFilter, setDateFilter] = useState<DateFilterType>("current")
  const [customDateRange, setCustomDateRange] = useState<DayPickerDateRange | undefined>()
  const [activeTab, setActiveTab] = useState<TabType>("all")

  const customRange: DateRange | undefined = customDateRange?.from
    ? { from: toISO(customDateRange.from), to: toISO(customDateRange.to ?? customDateRange.from) }
    : undefined

  const filtered = useMemo(
    () => filterData(properties, leases, payments, dateFilter, customRange, activeTab, today),
    // customRange is derived from customDateRange on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [properties, leases, payments, dateFilter, customDateRange, activeTab, today],
  )

  const { occupiedCount, totalPropertiesCount, occupancyRate } = calculateOccupancy(filtered.properties)

  return {
    dateFilter,
    setDateFilter,
    customDateRange,
    setCustomDateRange,
    customRange,
    activeTab,
    setActiveTab,
    totalPropertiesCount,
    occupiedCount,
    occupancyRate,
    revenue: {
      PEN: calculateRevenue(filtered.payments, leases, "PEN"),
      USD: calculateRevenue(filtered.payments, leases, "USD"),
    },
    // Overdue debt is a current balance, so it ignores the period filter.
    overdue: {
      PEN: calculateOverdue(payments, leases, properties, activeTab, "PEN"),
      USD: calculateOverdue(payments, leases, properties, activeTab, "USD"),
    },
    projection: {
      PEN: calculateProjection(filtered.payments, leases, "PEN"),
      USD: calculateProjection(filtered.payments, leases, "USD"),
    },
    recentPayments: getRecentActivity(filtered.payments),
  }
}
