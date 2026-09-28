import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewPropertyForm } from "@/components/NewPropertyForm";
import { getI18n } from "@/lib/i18n/server";

export default async function NewPropertyPage() {
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/properties" aria-label={t.common.back}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t.properties.newTitle}</h1>
      </div>
      <NewPropertyForm />
    </div>
  );
}
