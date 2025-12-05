import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getLeases, getPayments, getProperties, getTenants } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { ArrowLeft, Calendar, User, Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DownloadReceiptButton } from "@/components/DownloadReceiptButton";
import { RegisterPaymentDialog } from "@/components/RegisterPaymentDialog";
import { WhatsAppMessageButton } from "@/components/WhatsAppMessageButton";
import { PaymentActionsMenu } from "@/components/PaymentActionsMenu";
import { Fragment } from "react";

export default async function LeaseHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const leases = await getLeases();
  const lease = leases.find(l => l.id === id);

  if (!lease) {
    notFound();
  }

  const properties = await getProperties();
  const tenants = await getTenants();
  const payments = await getPayments();

  const property = properties.find(p => p.id === lease.propertyId);
  const tenant = tenants.find(t => t.id === lease.tenantId);
  const leasePayments = payments
    .filter(p => p.leaseId === lease.id)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const totalPaid = leasePayments.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
  const totalDue = leasePayments.reduce((acc, p) => acc + p.amount, 0);
  const balance = totalDue - totalPaid;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/leases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Historial del Contrato</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propiedad</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property?.name}</div>
            <p className="text-xs text-muted-foreground">
              {property?.location} - {property?.type === 'ROOM' ? 'Cuarto' : 'Local'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquilino</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant?.name}</div>
            <p className="text-xs text-muted-foreground">
              {tenant?.phone}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de Cuenta</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(balance, lease.currency)}</div>
            <p className="text-xs text-muted-foreground">
              Deuda Pendiente Total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha Vencimiento</TableHead>
              <TableHead>Monto Total</TableHead>
              <TableHead>Pagado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leasePayments.map((payment) => {
              // Calculate overdue days
              let overdueDays = 0;
              if (payment.status !== 'PAID') {
                const due = new Date(payment.dueDate);
                const today = new Date();
                due.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                if (today > due) {
                  const diffTime = Math.abs(today.getTime() - due.getTime());
                  overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
              }

              return (
                <Fragment key={payment.id}>
                  <TableRow className={payment.transactions?.length ? "border-b-0" : ""}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{payment.dueDate}</span>
                        {overdueDays > 0 && (
                          <span className="text-xs text-red-600 font-medium">
                            {overdueDays} días de retraso
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatMoney(payment.amount, lease.currency)}</TableCell>
                    <TableCell className={payment.amountPaid && payment.amountPaid > 0 ? "text-green-600 font-medium" : ""}>
                      {formatMoney(payment.amountPaid || 0, lease.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        payment.status === 'PAID' ? 'default' :
                          payment.status === 'PARTIAL' ? 'outline' :
                            payment.status === 'OVERDUE' ? 'destructive' : 'secondary'
                      }>
                        {payment.status === 'PAID' ? 'Pagado' :
                          payment.status === 'PARTIAL' ? 'Parcial' :
                            payment.status === 'OVERDUE' ? 'Vencido' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {tenant && property && (
                          <WhatsAppMessageButton
                            payment={{
                              amount: payment.amount,
                              amountPaid: payment.amountPaid || 0,
                              dueDate: payment.dueDate,
                              status: payment.status
                            }}
                            lease={{ currency: lease.currency }}
                            tenant={{ name: tenant.name, phone: tenant.phone }}
                            property={{ name: property.name }}
                            overdueDays={overdueDays}
                          />
                        )}

                        {payment.amountPaid > 0 && tenant && property && (
                          <DownloadReceiptButton
                            payment={{
                              id: payment.id,
                              amount: payment.amount,
                              amountPaid: payment.amountPaid || 0,
                              dueDate: payment.dueDate,
                              paidDate: payment.paidDate,
                              transactions: payment.transactions
                            }}
                            lease={{ currency: lease.currency }}
                            tenant={{ name: tenant.name, phone: tenant.phone }}
                            property={{ name: property.name }}
                          />
                        )}

                        {payment.status !== 'PAID' && (
                          <RegisterPaymentDialog
                            payment={{
                              id: payment.id,
                              amount: payment.amount,
                              amountPaid: payment.amountPaid || 0
                            }}
                            currency={lease?.currency || 'PEN'}
                          />
                        )}

                        <PaymentActionsMenu
                          payment={{
                            id: payment.id,
                            amount: payment.amount,
                            dueDate: payment.dueDate,
                            transactions: payment.transactions
                          }}
                          currency={lease.currency}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  {payment.transactions && payment.transactions.length > 0 && (
                    <TableRow key={`${payment.id} -tx`} className="bg-muted/30">
                      <TableCell colSpan={5} className="p-0">
                        <div className="px-4 py-2">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Historial de Pagos:</p>
                          <div className="space-y-1">
                            {payment.transactions.map((tx) => (
                              <div key={tx.id} className="flex justify-between text-xs max-w-md ml-4">
                                <span>{tx.date}</span>
                                <span className="font-medium text-green-600">
                                  + {formatMoney(tx.amount, lease.currency)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
            {leasePayments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No hay pagos registrados para este contrato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
