import { Property, Lease, Payment } from "@/lib/db"
import { startOfMonth, subMonths, subYears, isAfter, isSameMonth, parseISO, isWithinInterval } from "date-fns"
import { DateRange } from "react-day-picker"

export type DateFilterType = 'current' | '3m' | '6m' | '1y' | 'all' | 'custom'
export type TabType = 'all' | 'commercial' | 'room'

export function filterData(
  properties: Property[],
  leases: Lease[],
  payments: Payment[],
  dateFilter: DateFilterType,
  customDateRange: DateRange | undefined,
  activeTab: TabType
) {
  const now = new Date()
  let startDate: Date | null = null
  let endDate: Date | null = null

  if (dateFilter === 'current') {
    startDate = startOfMonth(now)
  } else if (dateFilter === '3m') {
    startDate = subMonths(now, 3)
  } else if (dateFilter === '6m') {
    startDate = subMonths(now, 6)
  } else if (dateFilter === '1y') {
    startDate = subYears(now, 1)
  } else if (dateFilter === 'custom' && customDateRange?.from) {
    startDate = customDateRange.from
    endDate = customDateRange.to || customDateRange.from
  }

  // Filter Payments by Date
  const filteredPayments = payments.filter(p => {
    if (dateFilter === 'all') return true

    const dueDate = parseISO(p.dueDate)

    if (dateFilter === 'custom' && startDate && endDate) {
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)
      return isWithinInterval(dueDate, { start: startDate, end: endOfDay })
    }

    if (startDate) {
      return isAfter(dueDate, startDate) || isSameMonth(dueDate, startDate)
    }

    return true
  })

  // Filter Properties by Type (Tab)
  const filteredProperties = properties.filter(p => {
    if (activeTab === 'all') return true
    if (activeTab === 'commercial') return p.type === 'COMMERCIAL'
    if (activeTab === 'room') return p.type === 'ROOM'
    return true
  })

  // Filter Payments by Property Type (Tab)
  const finalPayments = filteredPayments.filter(p => {
    const lease = leases.find(l => l.id === p.leaseId)
    const property = properties.find(prop => prop.id === lease?.propertyId)

    if (activeTab === 'all') return true
    if (activeTab === 'commercial') return property?.type === 'COMMERCIAL'
    if (activeTab === 'room') return property?.type === 'ROOM'
    return true
  })

  return {
    properties: filteredProperties,
    payments: finalPayments
  }
}

export function calculateOccupancy(properties: Property[]) {
  const totalPropertiesCount = properties.length
  const occupiedCount = properties.filter(p => p.status === 'OCCUPIED').length
  const occupancyRate = totalPropertiesCount > 0 ? Math.round((occupiedCount / totalPropertiesCount) * 100) : 0
  return { occupiedCount, totalPropertiesCount, occupancyRate }
}

export function calculateRevenue(payments: Payment[], leases: Lease[], currency: 'PEN' | 'USD') {
  return payments
    .filter(p => {
      const lease = leases.find(l => l.id === p.leaseId)
      return lease?.currency === currency && (p.amountPaid || 0) > 0
    })
    .reduce((acc, curr) => acc + (curr.amountPaid || 0), 0)
}

export function calculateOverdue(allPayments: Payment[], leases: Lease[], properties: Property[], activeTab: TabType, currency: 'PEN' | 'USD') {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Filter overdue payments
  const overduePayments = allPayments.filter(p => {
    if (p.status === 'PAID') return false
    const due = new Date(p.dueDate)
    due.setHours(0, 0, 0, 0)
    return today > due
  }).filter(p => {
    const lease = leases.find(l => l.id === p.leaseId)
    const property = properties.find(prop => prop.id === lease?.propertyId)
    if (activeTab === 'all') return true
    if (activeTab === 'commercial') return property?.type === 'COMMERCIAL'
    if (activeTab === 'room') return property?.type === 'ROOM'
    return true
  })

  return overduePayments
    .filter(p => leases.find(l => l.id === p.leaseId)?.currency === currency)
    .reduce((acc, curr) => acc + (curr.amount - (curr.amountPaid || 0)), 0)
}

export function calculateProjection(payments: Payment[], leases: Lease[], currency: 'PEN' | 'USD') {
  const relevantPayments = payments.filter(p => {
    const lease = leases.find(l => l.id === p.leaseId)
    return lease?.currency === currency
  })

  const totalExpected = relevantPayments.reduce((acc, p) => acc + p.amount, 0)
  const totalCollected = relevantPayments.reduce((acc, p) => acc + (p.amountPaid || 0), 0)

  return { totalExpected, totalCollected }
}

export function getRecentActivity(payments: Payment[]) {
  return payments
    .filter(p => p.status === 'PAID')
    .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
    .slice(0, 5)
}
