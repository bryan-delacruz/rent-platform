"use client"

import { useDashboardMetrics, DateFilterType, TabType } from "@/hooks/useDashboardMetrics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Activity, CreditCard, Home as HomeIcon, Calendar as CalendarIcon } from "lucide-react"
import { formatMoney, cn } from "@/lib/utils"
import { format } from "date-fns"
import { Property, Lease, Payment } from "@/lib/db" // Keep these types for the hook input

interface DashboardClientProps {
  properties: Property[]
  leases: Lease[]
  payments: Payment[]
  tenants: any[] // tenants is not used in the hook, but kept for the component prop signature
}

export default function DashboardClient({ properties, leases, payments, tenants }: DashboardClientProps) {
  const {
    dateFilter, setDateFilter,
    customDateRange, setCustomDateRange,
    activeTab, setActiveTab,
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
  } = useDashboardMetrics(properties, leases, payments)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
        <div className="flex items-center gap-2">
          {dateFilter === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !customDateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDateRange?.from ? (
                    customDateRange.to ? (
                      <>
                        {format(customDateRange.from, "LLL dd, y")} -{" "}
                        {format(customDateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(customDateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Seleccionar fechas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customDateRange?.from}
                  selected={customDateRange}
                  onSelect={setCustomDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}

          <Select value={dateFilter} onValueChange={(v: DateFilterType) => setDateFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Mes Actual</SelectItem>
              <SelectItem value="3m">Últimos 3 Meses</SelectItem>
              <SelectItem value="6m">Últimos 6 Meses</SelectItem>
              <SelectItem value="1y">Último Año</SelectItem>
              <SelectItem value="all">Todo el Historial</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">General</TabsTrigger>
          <TabsTrigger value="commercial">Locales Comerciales</TabsTrigger>
          <TabsTrigger value="room">Cuartos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-8">

          {/* Occupancy Card */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ocupación {activeTab === 'all' ? 'Total' : (activeTab === 'commercial' ? 'Locales' : 'Cuartos')}</CardTitle>
                <HomeIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {occupiedCount} / {totalPropertiesCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {occupancyRate}% ocupado
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* PEN Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">Soles (PEN)</h3>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos ({dateFilter === 'current' ? 'Mes Actual' : (dateFilter === 'custom' ? 'Rango Personalizado' : 'Periodo')})</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatMoney(revenuePEN, 'PEN')}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Proyección / Esperado</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectionPEN.totalExpected > 0 ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Progreso</span>
                        <span className="text-muted-foreground">
                          {formatMoney(projectionPEN.totalCollected, 'PEN')} / {formatMoney(projectionPEN.totalExpected, 'PEN')}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600"
                          style={{ width: `${(projectionPEN.totalCollected / projectionPEN.totalExpected) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No hay pagos registrados en este periodo.</p>
                  )}
                </CardContent>
              </Card>

              {overdueAmountPEN > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">Deuda Vencida</CardTitle>
                    <Activity className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-700">{formatMoney(overdueAmountPEN, 'PEN')}</div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* USD Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">Dólares (USD)</h3>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos ({dateFilter === 'current' ? 'Mes Actual' : (dateFilter === 'custom' ? 'Rango Personalizado' : 'Periodo')})</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatMoney(revenueUSD, 'USD')}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Proyección / Esperado</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectionUSD.totalExpected > 0 ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Progreso</span>
                        <span className="text-muted-foreground">
                          {formatMoney(projectionUSD.totalCollected, 'USD')} / {formatMoney(projectionUSD.totalExpected, 'USD')}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${(projectionUSD.totalCollected / projectionUSD.totalExpected) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No hay pagos registrados en este periodo.</p>
                  )}
                </CardContent>
              </Card>

              {overdueAmountUSD > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">Deuda Vencida</CardTitle>
                    <Activity className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-700">{formatMoney(overdueAmountUSD, 'USD')}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Pagos Recientes ({activeTab === 'all' ? 'General' : (activeTab === 'commercial' ? 'Locales' : 'Cuartos')})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentPayments.map(payment => {
                    const lease = leases.find(l => l.id === payment.leaseId)
                    const tenant = tenants.find(t => t.id === lease?.tenantId)
                    return (
                      <div key={payment.id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{tenant?.name || 'Inquilino'}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.paidDate}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          +{formatMoney(payment.amountPaid || payment.amount, lease?.currency || 'PEN')}
                        </div>
                      </div>
                    )
                  })}
                  {recentPayments.length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay actividad reciente en este periodo.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </TabsContent>
      </Tabs>
    </div>
  )
}
