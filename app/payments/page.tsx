import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getProperties, readDb } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { GeneratePaymentsButton } from "@/components/GeneratePaymentsButton";
import { RegisterPaymentDialog } from "@/components/RegisterPaymentDialog";
import { WhatsAppMessageButton } from "@/components/WhatsAppMessageButton";
import { DownloadReceiptButton } from "@/components/DownloadReceiptButton";
import { PaymentActionsMenu } from "@/components/PaymentActionsMenu";

export default async function PaymentsPage() {
  const db = await readDb();
  const payments = db.payments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  const leases = db.leases;
  const properties = db.properties;

  const leaseMap = new Map(leases.map(l => [l.id, l]));
  const propertyMap = new Map(properties.map(p => [p.id, p]));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Recibos</h2>
        <GeneratePaymentsButton />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Propiedad</TableHead>
              <TableHead>Fecha de Vencimiento</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de Pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const lease = leaseMap.get(payment.leaseId);
              const property = lease ? propertyMap.get(lease.propertyId) : null;
              const tenant = lease ? db.tenants.find(t => t.id === lease.tenantId) : null;
              const currencySymbol = lease?.currency === 'USD' ? '$' : 'S/.';

              // Calculate overdue days
              let overdueDays = 0;
              if (payment.status !== 'PAID') {
                const due = new Date(payment.dueDate);
                const today = new Date();
                // Reset time part for accurate day calculation
                due.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                if (today > due) {
                  const diffTime = Math.abs(today.getTime() - due.getTime());
                  overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
              }

              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{property?.name || 'Desconocido'}</TableCell>
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
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{lease ? formatMoney(payment.amount, lease.currency) : payment.amount}</span>
                      {payment.amountPaid > 0 && payment.amountPaid < payment.amount && (
                        <span className="text-xs text-green-600 font-medium">
                          Abonado: {lease ? formatMoney(payment.amountPaid, lease.currency) : payment.amountPaid}
                        </span>
                      )}
                    </div>
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
                  <TableCell>{payment.paidDate || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {lease && tenant && property && (
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

                      {payment.amountPaid > 0 && lease && tenant && property && (
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

                      {lease && (
                        <PaymentActionsMenu
                          payment={{
                            id: payment.id,
                            amount: payment.amount,
                            dueDate: payment.dueDate,
                            transactions: payment.transactions
                          }}
                          currency={lease.currency}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron registros de pagos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
