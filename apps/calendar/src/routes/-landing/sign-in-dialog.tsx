import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { sessionQuery } from "@/lib/queries";
import { pollSignIn, startSignIn } from "@/server/auth.functions";

/** Wraps a trigger; opening starts a Telegram sign-in and polls until the bot confirms it. */
export function SignInDialog({ next, children }: { next: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">{open && <SignInFlow next={next} />}</DialogContent>
    </Dialog>
  );
}

function SignInFlow({ next }: { next: string }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const startFn = useServerFn(startSignIn);
  const pollFn = useServerFn(pollSignIn);

  // Created when the dialog opens, so the Telegram link is a real anchor that opens on click
  // instead of being caught by popup blockers.
  const start = useQuery({
    queryKey: ["sign-in"],
    queryFn: () => startFn(),
    gcTime: 0,
    staleTime: Infinity,
  });

  const poll = useQuery({
    queryKey: ["sign-in", "poll", start.dataUpdatedAt],
    queryFn: () => pollFn(),
    enabled: start.isSuccess,
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 2000 : false),
    refetchIntervalInBackground: true,
    gcTime: 0,
  });

  const status = poll.data?.status;

  useEffect(() => {
    if (status !== "approved") return;

    // The cached session still says "signed out" and is fresh for minutes; nothing on this page
    // observes it, so invalidating would not refetch it and the app's guard would bounce back
    // here. Read it again with the new cookie, then go.
    void queryClient
      .fetchQuery({ ...sessionQuery, staleTime: 0 })
      .then(() => navigate({ to: next }));
  }, [status, queryClient, navigate, next]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Sign in with Telegram</DialogTitle>
        <DialogDescription>
          Confirm the sign-in in the ReMoodle bot, then come back to this tab.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        {status === "expired" ? (
          <Button onClick={() => void start.refetch()}>Start again</Button>
        ) : start.data ? (
          <Button asChild>
            <a href={start.data.url} target="_blank" rel="noopener noreferrer">
              <SendIcon data-icon="inline-start" />
              Continue in Telegram
            </a>
          </Button>
        ) : (
          <Button disabled>
            <Spinner data-icon="inline-start" />
            Preparing…
          </Button>
        )}
        <p role="status" className="text-sm text-muted-foreground">
          {status === "pending" && "Waiting for confirmation in Telegram…"}
          {status === "approved" && "Signed in. Opening your calendar…"}
          {status === "expired" && "This sign-in link expired."}
        </p>
        {(start.error || poll.error) && (
          <p role="alert" className="text-sm text-destructive">
            Could not reach ReMoodle. Try again.
          </p>
        )}
      </div>
    </>
  );
}
