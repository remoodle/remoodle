import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { sessionQuery } from "@/lib/queries";
import { FeatureCards } from "./-landing/feature-cards";
import { Hero } from "./-landing/hero";
import { SignInDialog } from "./-landing/sign-in-dialog";

// Only same-site paths are honoured after sign-in; anything else would be an open redirect.
const landingSearchSchema = z.object({
  next: z
    .string()
    .refine((value) => value.startsWith("/") && !value.startsWith("//"))
    .optional()
    .catch(undefined),
});

/** The public landing page: fully server-rendered and streamed, the only page search engines see. */
export const Route = createFileRoute("/")({
  validateSearch: landingSearchSchema,
  beforeLoad: async ({ context, search }) => {
    // An unreachable API reads as signed out, so the landing page always renders.
    const session = await context.queryClient.ensureQueryData(sessionQuery).catch(() => null);

    if (session?.user) throw redirect({ href: search.next ?? "/calendar" });
  },
  head: () => ({
    meta: [
      { title: "ReMoodle Calendar · Your AITU week in one place" },
      {
        name: "description",
        content:
          "Classes from My DU and deadlines from Moodle in one calendar, with reminders in Telegram.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { next = "/calendar" } = Route.useSearch();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 bg-[color-mix(in_srgb,var(--background)_92%,transparent)] backdrop-blur-[8px]">
        <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-5">
          <a href="/" className="flex items-center gap-2 text-xl">
            <BrandMark className="size-6 text-primary" />
            <span className="type-wordmark">remoodle</span>
          </a>
          <SignInDialog next={next}>
            <Button variant="secondary">Sign in</Button>
          </SignInDialog>
        </nav>
      </header>
      <main className="flex flex-col gap-[110px] pb-[110px]">
        <Hero next={next} />
        <FeatureCards />
      </main>
    </div>
  );
}
