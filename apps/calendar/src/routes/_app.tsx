import { noop } from "@tanstack/react-query";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { moodleQuery, myDuQuery, sessionQuery } from "@/lib/queries";
import { AppSidebar } from "./_app/-components/app-sidebar";

/**
 * The signed-in app. `data-only`: the session check and data loading run on the server, so an
 * anonymous visitor is redirected before any HTML is sent, while the calendar itself renders in
 * the browser, where the user's stored filters live.
 */
export const Route = createFileRoute("/_app")({
  ssr: "data-only",
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery);

    if (!session.user) throw redirect({ to: "/", search: { next: location.href } });

    return { user: session.user, links: session.links };
  },
  loader: ({ context }) => {
    // The sidebar needs both sources; Moodle is a live fetch, so it streams in rather than blocking.
    void context.queryClient.prefetchQuery(moodleQuery).catch(noop);

    return context.queryClient.ensureQueryData(myDuQuery);
  },
  pendingComponent: AppPending,
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider className="h-svh" defaultOpen={readSidebarCookie()}>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}

// The sidebar primitive persists its state in this cookie; this route renders in the browser.
function readSidebarCookie() {
  return !document.cookie.split("; ").includes("sidebar_state=false");
}

// Server-rendered placeholder shown until the app hydrates.
function AppPending() {
  return (
    <div className="flex h-svh gap-2 bg-muted p-2">
      <div className="hidden w-64 flex-col gap-3 p-2 md:flex">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-56" />
        <Skeleton className="h-24" />
      </div>
      <div className="flex-1 rounded-3xl bg-background shadow-md" />
    </div>
  );
}
