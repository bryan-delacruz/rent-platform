import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewTenantForm } from "@/components/NewTenantForm";
import { getI18n } from "@/lib/i18n/server";

export default async function NewTenantPage() {
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tenants" aria-label={t.common.back}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t.tenants.newTitle}</h1>
      </div>
      <NewTenantForm />
    </div>
  );
}
