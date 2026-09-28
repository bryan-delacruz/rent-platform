import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Building2, FileText, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { getI18n } from "@/lib/i18n/server";

const REPO_URL = "https://github.com/bryan-delacruz/rent-platform";
const featureIcons = [FileText, Building2, LineChart];

export default async function LandingPage() {
  const { userId } = await auth();
  const { t } = await getI18n();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-4 md:px-8">
        <span className="text-xl font-bold text-primary">Rent Platform</span>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          {userId ? (
            <Button asChild size="sm">
              <Link href="/dashboard">{t.nav.dashboard}</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/sign-in">{t.landing.signIn}</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t.landing.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">{t.landing.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t.landing.subtitle}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              {/* A plain link: /demo is a route handler that signs the visitor in. */}
              <a href="/demo">
                {t.landing.tryDemo} <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </a>
            </Button>
            {!userId && (
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-up">{t.landing.signUp}</Link>
              </Button>
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t.landing.demoHint}</p>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-16 md:grid-cols-3">
          {t.landing.features.map((feature, index) => {
            const Icon = featureIcons[index % featureIcons.length];
            return (
              <div key={feature.title} className="rounded-lg border bg-card p-6">
                <Icon className="h-6 w-6 text-primary" aria-hidden />
                <h2 className="mt-4 font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
              </div>
            );
          })}
        </section>
      </main>

      <footer className="flex flex-col items-center justify-between gap-2 border-t px-4 py-6 text-sm text-muted-foreground md:flex-row md:px-8">
        <span>{t.landing.stack}</span>
        <a href={REPO_URL} className="underline underline-offset-4 hover:text-foreground">
          {t.landing.source}
        </a>
      </footer>
    </div>
  );
}
