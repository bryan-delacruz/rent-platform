"use client"

import { Activity, Calendar as CalendarIcon, CreditCard, Home as HomeIcon } from "lucide-react"
import { useDashboardMetrics, type DateFilterType, type TabType } from "@/hooks/useDashboardMetrics"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatMoney } from "@/lib/format"
import { interpolate } from "@/lib/i18n"
import { useI18n } from "@/lib/i18n/client"
import { cn } from "@/lib/utils"
import type { Currency, ISODate, Lease, Payment, Property, Tenant } from "@/lib/types"

interface DashboardClientProps {
  properties: Property[]
  leases: Lease[]
  payments: Payment[]
  tenants: Tenant[]
  today: ISODate
}

const periods: DateFilterType[] = ["current", "3m", "6m", "1y", "all", "custom"]
const currencies: Currency[] = ["PEN", "USD"]

export default function DashboardClient({ properties, leases, payments, tenants, today }: DashboardClientProps) {
  const { locale, t } = useI18n()
  const d = t.dashboard
  const metrics = useDashboardMetrics(properties, leases, payments, today)
  const leaseById = new Map(leases.map((lease) => [lease.id, lease]))
  const tenantById = new Map(tenants.map((tenant) => [tenant.id, tenant]))

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold tracking-tight">{d.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {metrics.dateFilter === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-[260px] justify-start text-left font-normal", !metrics.customRange && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" aria-hidden />
                  {metrics.customRange
                    ? `${formatDate(metrics.customRange.from, locale)} – ${formatDate(metrics.customRange.to, locale)}`
                    : d.pickDates}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  defaultMonth={metrics.customDateRange?.from}
                  selected={metrics.customDateRange}
                  onSelect={metrics.setCustomDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}

          <Select value={metrics.dateFilter} onValueChange={(value) => metrics.setDateFilter(value as DateFilterType)}>
            <SelectTrigger className="w-[190px]" aria-label={d.period}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period} value={period}>
                  {d.periods[period]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={metrics.activeTab} onValueChange={(value) => metrics.setActiveTab(value as TabType)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{d.tabs.all}</TabsTrigger>
          <TabsTrigger value="commercial">{d.tabs.commercial}</TabsTrigger>
          <TabsTrigger value="room">{d.tabs.room}</TabsTrigger>
        </TabsList>

        <TabsContent value={metrics.activeTab} className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{d.occupancy}</CardTitle>
                <HomeIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.occupiedCount} / {metrics.totalPropertiesCount}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {interpolate(d.occupiedPct, { percent: metrics.occupancyRate })}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {currencies.map((currency) => {
              const money = (value: number) => formatMoney(value, currency, locale)
              const projection = metrics.projection[currency]
              const progress = projection.totalExpected > 0 ? (projection.totalCollected / projection.totalExpected) * 100 : 0
              return (
                <section key={currency} className="space-y-4" aria-label={t.currency[currency]}>
                  <h2 className="text-lg font-semibold text-muted-foreground">{t.currency[currency]}</h2>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {d.revenue} · {d.periods[metrics.dateFilter]}
                      </CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{money(metrics.revenue[currency])}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{d.expected}</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent>
                      {projection.totalExpected > 0 ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm font-medium">
                            <span>{d.progress}</span>
                            <span className="text-muted-foreground">
                              {money(projection.totalCollected)} / {money(projection.totalExpected)}
                            </span>
                          </div>
                          <div
                            className="h-2 w-full overflow-hidden rounded-full bg-secondary"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(progress)}
                          >
                            <div className="h-full bg-green-600" style={{ width: `${Math.min(progress, 100)}%` }} />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">{d.noPaymentsPeriod}</p>
                      )}
                    </CardContent>
                  </Card>

                  {metrics.overdue[currency] > 0 && (
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-900">{d.overdue}</CardTitle>
                        <Activity className="h-4 w-4 text-red-600" aria-hidden />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-700">{money(metrics.overdue[currency])}</div>
                      </CardContent>
                    </Card>
                  )}
                </section>
              )
            })}
          </div>

          <Card className="lg:max-w-3xl">
            <CardHeader>
              <CardTitle>{d.recent}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6">
                {metrics.recentPayments.map((payment) => {
                  const lease = leaseById.get(payment.leaseId)
                  const tenant = lease ? tenantById.get(lease.tenantId) : undefined
                  return (
                    <li key={payment.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{tenant?.name ?? d.tenantFallback}</p>
                        <p className="text-sm text-muted-foreground">{payment.paidDate ? formatDate(payment.paidDate, locale) : ""}</p>
                      </div>
                      <div className="ml-auto font-medium">
                        + {lease ? formatMoney(payment.amountPaid, lease.currency, locale) : payment.amountPaid}
                      </div>
                    </li>
                  )
                })}
                {metrics.recentPayments.length === 0 && <li className="text-sm text-muted-foreground">{d.noRecent}</li>}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
