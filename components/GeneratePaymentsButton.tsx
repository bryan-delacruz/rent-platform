'use client';

import { Button } from "@/components/ui/button";
import { generateMonthlyPayments } from "@/lib/actions";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function GeneratePaymentsButton() {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateMonthlyPayments(true);
      if (result.created > 0) {
        toast.success(`Se generaron ${result.created} nuevos pagos exitosamente.`);
      } else {
        toast.info("No se generaron nuevos pagos. Todos los contratos activos ya tienen pagos para este mes.");
      }
    } catch (error) {
      toast.error("Error al generar pagos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleGenerate} disabled={loading}>
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Generando...' : 'Generar Pagos del Mes'}
    </Button>
  );
}
