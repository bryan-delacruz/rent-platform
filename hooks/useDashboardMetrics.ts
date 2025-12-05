import { useState, useMemo } from "react"
import { Property, Lease, Payment } from "@/lib/db"
import { DateRange as DayPickerDateRange } from "react-day-picker"
import {
  DateFilterType,
  TabType,
  filterData,
  calculateOccupancy,
  calculateRevenue,
  calculateOverdue,
  calculateProjection,
  getRecentActivity
} from "@/lib/analytics"

export type { DateFilterType, TabType }

export function useDashboardMetrics(
  properties: Property[],
  leases: Lease[],
  payments: Payment[]
) {
  const [dateFilter, setDateFilter] = useState<DateFilterType>('current')
  const [customDateRange, setCustomDateRange] = useState<DayPickerDateRange | undefined>()
  const [activeTab, setActiveTab] = useState<TabType>('all')

  // Filter Data based on Filters
  const filteredData = useMemo(() => {
    return filterData(properties, leases, payments, dateFilter, customDateRange, activeTab)
  }, [dateFilter, customDateRange, activeTab, payments, properties, leases])

  // --- Metrics Calculation ---

  // Occupancy
  const { occupiedCount, totalPropertiesCount, occupancyRate } = calculateOccupancy(filteredData.properties)

  // Revenue (Historical / Filtered)
  const revenuePEN = calculateRevenue(filteredData.payments, leases, 'PEN')
  const revenueUSD = calculateRevenue(filteredData.payments, leases, 'USD')

  // Overdue (Always Current Status, but filtered by Tab)
  // Note: we pass 'payments' (all payments) not 'filteredData.payments' for overdue check as it is usually time-independent (current state)
  const overdueAmountPEN = calculateOverdue(payments, leases, properties, activeTab, 'PEN')
  const overdueAmountUSD = calculateOverdue(payments, leases, properties, activeTab, 'USD')

  // Monthly Projection
  const projectionPEN = calculateProjection(filteredData.payments, leases, 'PEN')
  const projectionUSD = calculateProjection(filteredData.payments, leases, 'USD')

  // Recent Activity
  const recentPayments = getRecentActivity(filteredData.payments)

  return {
    // State
    dateFilter,
    setDateFilter,
    customDateRange,
    setCustomDateRange,
    activeTab,
    setActiveTab,

    // Metrics
    totalPropertiesCount,
    occupiedCount,
    occupancyRate,
    revenuePEN,
    revenueUSD,
    overdueAmountPEN,
    overdueAmountUSD,
    projectionPEN,
    projectionUSD,
    recentPayments
  }
}
