import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { MY_DU_TERMS, type MyDuTerm } from "@remoodle/library/my-du/schemas";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { myDuQuery } from "@/lib/queries";
import {
  changeMyDuPeriod,
  connectMyDu,
  disconnectMyDu,
  startMyDuSignIn,
  syncMyDu,
} from "@/server/my-du.functions";
import { SettingsSection, SettingsSectionActions, SettingsSectionHeader } from "./settings-section";

function termLabel(term: number) {
  return term === -1 ? "Additional period 1" : `Term ${term}`;
}

function formatMoment(time: string | number | null) {
  return time
    ? new Date(time).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "Never";
}

export function MyDuSettings() {
  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery(myDuQuery);
  const [dialog, setDialog] = useState<"connect" | "period" | null>(null);
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: myDuQuery.queryKey });
  const onError = (cause: Error) => toast.error(cause.message);
  const sync = useMutation({ mutationFn: useServerFn(syncMyDu), onSuccess, onError });
  const disconnect = useMutation({ mutationFn: useServerFn(disconnectMyDu), onSuccess, onError });
  const connection = data?.connection;

  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="My DU schedule"
        description="Your university classes. Also available in the bot with /mydu."
      >
        {connection && (
          <Badge variant="secondary">{connection.connected ? "Connected" : "Updates paused"}</Badge>
        )}
      </SettingsSectionHeader>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
      {connection && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Period</dt>
            <dd>
              {connection.studyYear}–{connection.studyYear + 1}, {termLabel(connection.term)}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Teaching week 1 starts</dt>
            <dd className="tabular-nums">{connection.firstWeekStart}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Saved classes</dt>
            <dd className="tabular-nums">{data.events.length}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Last synced</dt>
            <dd>{formatMoment(connection.lastSyncedAt)}</dd>
          </div>
        </dl>
      )}
      {connection?.syncError && (
        <p role="alert" className="text-sm text-destructive">
          {connection.syncError}
        </p>
      )}
      <SettingsSectionActions>
        {connection?.connected ? (
          <>
            <Button variant="outline" disabled={sync.isPending} onClick={() => sync.mutate({})}>
              {sync.isPending && <Spinner data-icon="inline-start" />}
              {sync.isPending ? "Syncing…" : "Sync now"}
            </Button>
            <Button variant="outline" onClick={() => setDialog("period")}>
              Change period
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" disabled={disconnect.isPending}>
                  Disconnect
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect My DU?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Automatic updates stop and your login is deleted. Saved classes stay.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep connected</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => disconnect.mutate({})}>
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Button disabled={isPending || !!error} onClick={() => setDialog("connect")}>
            {connection ? "Reconnect My DU" : "Connect My DU"}
          </Button>
        )}
      </SettingsSectionActions>
      <MyDuDialog
        mode={dialog}
        period={
          connection
            ? { term: connection.term, firstWeekStart: connection.firstWeekStart }
            : undefined
        }
        onClose={() => setDialog(null)}
      />
    </SettingsSection>
  );
}

const terms = MY_DU_TERMS.map((term) => ({ value: String(term), label: termLabel(term), term }));

function MyDuDialog({
  mode,
  period,
  onClose,
}: {
  mode: "connect" | "period" | null;
  period: { term: number; firstWeekStart: string } | undefined;
  onClose: () => void;
}) {
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {mode && <MyDuForm key={mode} mode={mode} period={period} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

// "connect" signs in to My DU again; "period" only switches which period is imported.
function MyDuForm({
  mode,
  period,
  onDone,
}: {
  mode: "connect" | "period";
  period: { term: number; firstWeekStart: string } | undefined;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();

  const [term, setTerm] = useState<MyDuTerm>(
    terms.find((item) => item.term === period?.term)?.term ?? 1,
  );

  const [firstWeekStart, setFirstWeekStart] = useState(period?.firstWeekStart ?? "");
  const [callbackUrl, setCallbackUrl] = useState("");

  const onSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: myDuQuery.queryKey });
    toast.success(mode === "connect" ? "My DU connected" : "Period changed");
    onDone();
  };

  // Requested when the dialog opens, so the Microsoft link is a real anchor that is never popup-blocked.
  const startSignIn = useServerFn(startMyDuSignIn);

  const start = useQuery({
    queryKey: ["my-du-sign-in"],
    queryFn: () => startSignIn(),
    enabled: mode === "connect",
    gcTime: 0,
    staleTime: Infinity,
  });

  const connect = useMutation({ mutationFn: useServerFn(connectMyDu), onSuccess });
  const change = useMutation({ mutationFn: useServerFn(changeMyDuPeriod), onSuccess });
  const submit = mode === "connect" ? connect : change;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();

        if (mode === "connect") connect.mutate({ data: { term, firstWeekStart, callbackUrl } });
        else change.mutate({ data: { term, firstWeekStart } });
      }}
    >
      <DialogHeader>
        <DialogTitle>{mode === "period" ? "Change period" : "Connect My DU"}</DialogTitle>
        <DialogDescription>
          {mode === "period"
            ? "Import classes for another academic period. Your login stays connected."
            : "Sign in with your university Microsoft account, then paste the final address here."}
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        {mode === "connect" && (
          <>
            <Field>
              <FieldLabel>1. Sign in to My DU</FieldLabel>
              <FieldDescription>
                My DU may open as a blank page. Copy its full address and paste it below within a
                few minutes.
              </FieldDescription>
              <div className="flex flex-wrap gap-2">
                {start.data ? (
                  <Button asChild variant="outline">
                    <a href={start.data.url} target="_blank" rel="noopener noreferrer">
                      Sign in with Microsoft
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    <Spinner data-icon="inline-start" />
                    Preparing…
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  disabled={start.isFetching}
                  onClick={() => void start.refetch()}
                >
                  Start again
                </Button>
              </div>
              {start.error && <FieldError>{start.error.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="my-du-link">2. Paste the My DU address</FieldLabel>
              <Input
                id="my-du-link"
                type="password"
                autoComplete="off"
                spellCheck={false}
                required
                maxLength={20_000}
                placeholder="https://my-du.astanait.edu.kz/login#code=…"
                value={callbackUrl}
                onChange={(event) => setCallbackUrl(event.target.value)}
              />
              <FieldDescription>
                The address holds a one-time login code. Your password never reaches ReMoodle.
              </FieldDescription>
            </Field>
          </>
        )}
        <Field>
          <FieldLabel htmlFor="my-du-term">Academic period</FieldLabel>
          <Select
            value={String(term)}
            onValueChange={(value) => {
              const next = terms.find((item) => item.value === value);

              if (next) setTerm(next.term);
            }}
          >
            <SelectTrigger id="my-du-term" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {terms.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="my-du-week">Monday of teaching week 1</FieldLabel>
          <Input
            id="my-du-week"
            type="date"
            required
            value={firstWeekStart}
            onChange={(event) => setFirstWeekStart(event.target.value)}
          />
          <FieldDescription>
            My DU only gives week numbers, so this date from your academic calendar puts each class
            on the right day.
          </FieldDescription>
        </Field>
        {submit.error && <FieldError>{submit.error.message}</FieldError>}
      </FieldGroup>
      <DialogFooter>
        <Button type="submit" disabled={submit.isPending}>
          {submit.isPending && <Spinner data-icon="inline-start" />}
          {submit.isPending
            ? "Importing your classes…"
            : mode === "period"
              ? "Change period"
              : "Connect"}
        </Button>
      </DialogFooter>
    </form>
  );
}
