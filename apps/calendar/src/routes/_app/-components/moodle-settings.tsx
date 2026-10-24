import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { moodleQuery } from "@/lib/queries";
import { connectMoodle, disconnectMoodle } from "@/server/moodle.functions";
import { SettingsSection, SettingsSectionActions, SettingsSectionHeader } from "./settings-section";

export function MoodleSettings() {
  const queryClient = useQueryClient();
  const { data, isPending, isFetching, error, refetch } = useQuery(moodleQuery);
  const [open, setOpen] = useState(false);
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: moodleQuery.queryKey });

  const disconnect = useMutation({
    mutationFn: useServerFn(disconnectMoodle),
    onSuccess,
    onError: (cause) => toast.error(cause.message),
  });

  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Moodle calendar"
        description="Assignments, quizzes and other course events. Also available in the bot with /update."
      >
        {data?.connected && <Badge variant="secondary">Connected</Badge>}
      </SettingsSectionHeader>
      {isPending && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading your connection…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
      {data?.connected && (
        <div className="flex flex-col gap-1 text-sm">
          <p>{data.events.length} events loaded</p>
          <p className="text-muted-foreground">
            {data.fetchedAt &&
              `Fetched ${new Date(data.fetchedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}. `}
            Only dates included in your Moodle export are available.
          </p>
        </div>
      )}
      <SettingsSectionActions>
        {(data?.connected || error) && (
          <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
            {isFetching && <Spinner data-icon="inline-start" />}
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        )}
        <Button
          variant={data?.connected ? "outline" : "default"}
          disabled={isPending}
          onClick={() => setOpen(true)}
        >
          {data?.connected ? "Replace calendar URL" : "Connect Moodle"}
        </Button>
        {data?.connected && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" disabled={disconnect.isPending}>
                Disconnect
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect Moodle?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes your Moodle calendar URL and stops deadline reminders in the bot.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => disconnect.mutate({})}>
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </SettingsSectionActions>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {open && <MoodleForm replacing={!!data?.connected} onDone={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
}

function MoodleForm({ replacing, onDone }: { replacing: boolean; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");

  const connect = useMutation({
    mutationFn: useServerFn(connectMoodle),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: moodleQuery.queryKey });
      toast.success("Moodle connected");
      onDone();
    },
  });

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        connect.mutate({ data: { url } });
      }}
    >
      <DialogHeader>
        <DialogTitle>Connect Moodle calendar</DialogTitle>
        <DialogDescription>
          Use a private calendar export URL. No Moodle password needed.
        </DialogDescription>
      </DialogHeader>
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
        <li>
          Open{" "}
          <a
            href="https://lms.astanait.edu.kz/calendar/export.php"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            Moodle calendar export
          </a>
          .
        </li>
        <li>
          Choose <span className="font-medium text-foreground">All events</span> and{" "}
          <span className="font-medium text-foreground">Custom range</span>. Cover your academic
          year to browse every week.
        </li>
        <li>
          Click <span className="font-medium text-foreground">Get calendar URL</span>, then copy and
          paste it below.
        </li>
      </ol>
      <FieldGroup>
        <Field data-invalid={connect.isError || undefined}>
          <FieldLabel htmlFor="moodle-url">Calendar URL</FieldLabel>
          <Input
            id="moodle-url"
            type="password"
            autoComplete="off"
            spellCheck={false}
            maxLength={4096}
            required
            placeholder="Paste your Moodle calendar URL"
            aria-invalid={connect.isError || undefined}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <FieldDescription>
            The URL grants read access to your Moodle calendar, so keep it private.
            {replacing && " It replaces your current calendar once the new one loads."}
          </FieldDescription>
          {connect.error && <FieldError>{connect.error.message}</FieldError>}
        </Field>
      </FieldGroup>
      <DialogFooter>
        <Button type="submit" disabled={connect.isPending}>
          {connect.isPending && <Spinner data-icon="inline-start" />}
          {connect.isPending ? "Connecting…" : "Connect Moodle"}
        </Button>
      </DialogFooter>
    </form>
  );
}
