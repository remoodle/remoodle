import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BellIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronRightIcon,
  DownloadIcon,
  MoonIcon,
  Settings2Icon,
  SunIcon,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/use-theme";

// Static reference page: fully server-rendered, no data.
export const Route = createFileRoute("/design-system")({
  head: () => ({ meta: [{ title: "Design system · ReMoodle Calendar" }] }),
  component: DesignSystemPage,
});

const colorRoles = [
  ["background", "bg-background text-foreground", "Paper"],
  ["card", "bg-card text-card-foreground", "Pane"],
  ["muted", "bg-muted text-muted-foreground", "Mist"],
  ["primary", "bg-primary text-primary-foreground", "ReMoodle blue"],
  ["secondary", "bg-secondary text-secondary-foreground", "Night"],
  ["sidebar", "bg-sidebar text-sidebar-foreground", "Sidebar"],
] as const;

const eventColors = [
  ["Lectures", "bg-event-lecture-soft text-event-lecture"],
  ["Online classes", "bg-event-online-soft text-event-online"],
  ["In-person practice", "bg-event-practice-soft text-event-practice"],
  ["Moodle assignments", "bg-event-assignment-soft text-event-assignment"],
  ["Quizzes and events", "bg-event-quiz-soft text-event-quiz"],
  ["Attendance", "bg-event-attendance-soft text-event-attendance"],
] as const;

const typeScale = [
  ["type-display", "72 / 1.02 / 600 / -0.04em", "Your week, calmly"],
  ["type-headline", "44 / 1.1 / 600 / -0.03em", "Classes and deadlines together"],
  ["type-title", "22 / 1.25 / 600 / -0.02em", "Moodle calendar"],
  ["type-lead", "19 / 1.5 / 400", "Classes from My DU and deadlines from Moodle."],
  ["text-sm", "14 / 1.43 / 400", "Reminders arrive in Telegram three hours before."],
] as const;

const buttonVariants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;

function DesignSystemPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-5 py-12">
      <Header />
      <Section title="Color roles" description="Every surface with its foreground.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {colorRoles.map(([token, classes, name]) => (
            <div
              key={token}
              className={`flex h-28 flex-col justify-between rounded-3xl p-4 ring-1 ring-border ${classes}`}
            >
              <span className="text-2xl font-semibold">Aa</span>
              <span className="text-sm">
                {name} · <code>{token}</code>
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section
        title="Event calendars"
        description="Fixed per calendar so a week reads at a glance."
      >
        <div className="flex flex-wrap gap-2">
          {eventColors.map(([name, classes]) => (
            <div
              key={name}
              className={`flex w-44 flex-col gap-0.5 rounded-md px-2.5 py-2 text-[13px] ${classes}`}
            >
              <span className="font-semibold">{name}</span>
              <span className="tabular-nums opacity-75">09:00 – 10:50 · C1.2.248</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Typography" description="Hanken Grotesk, one family.">
        <div className="flex flex-col divide-y">
          {typeScale.map(([token, spec, sample]) => (
            <div key={token} className="grid gap-2 py-4 md:grid-cols-[12rem_1fr]">
              <div className="text-sm text-muted-foreground">
                <code className="text-foreground">{token}</code>
                <div>{spec}</div>
              </div>
              <p className={`${token} truncate`}>{sample}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Buttons" description="Pills. Hover only shifts the fill.">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {buttonVariants.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant === "default" ? "Sign in with Telegram" : variant}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Landing call to action</Button>
            <Button size="icon" variant="outline" aria-label="Download">
              <DownloadIcon />
            </Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Connected</Badge>
            <Badge variant="secondary">Updates paused</Badge>
            <Badge variant="outline">12 events</Badge>
            <Badge variant="destructive">Sync failed</Badge>
          </div>
        </div>
      </Section>
      <Section title="Fields" description="Forms use Field, never ad-hoc layout.">
        <div className="grid gap-8 md:grid-cols-2">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ds-url">Calendar URL</FieldLabel>
              <Input id="ds-url" type="password" placeholder="Paste your Moodle calendar URL" />
              <FieldDescription>The URL grants read access, so keep it private.</FieldDescription>
            </Field>
            <Field data-invalid>
              <FieldLabel htmlFor="ds-week">Monday of teaching week 1</FieldLabel>
              <Input id="ds-week" aria-invalid defaultValue="2026-09-08" />
              <FieldDescription>Teaching week 1 must start on a Monday.</FieldDescription>
            </Field>
          </FieldGroup>
          <Tabs defaultValue="ical">
            <TabsList>
              <TabsTrigger value="ical">iCal</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
            </TabsList>
            <TabsContent value="ical" className="pt-3 text-sm text-muted-foreground">
              Subscribe from Google Calendar, Apple Calendar or anything that reads iCal.
            </TabsContent>
            <TabsContent value="image" className="pt-3 text-sm text-muted-foreground">
              A PNG of one week in your current theme.
            </TabsContent>
          </Tabs>
        </div>
      </Section>
      <Section
        title="Sidebar"
        description="One highlight travels between rows. Hover the rows; the active row is a sheet of paper."
      >
        <SidebarPreview />
      </Section>
      <Section
        title="Mist card and reminder"
        description="Landing-page recipes: grain, crop, one glow."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grain flex h-80 flex-col gap-2 rounded-[28px] bg-muted p-8">
            <span className="text-sm text-muted-foreground">Never miss a deadline</span>
            <h3 className="type-title">Moodle due dates in your week</h3>
            <div className="mt-auto -mb-8 flex flex-col gap-1.5 rounded-t-3xl bg-card p-4 shadow-md">
              <div className="rounded-md bg-event-assignment-soft px-2.5 py-1.5 text-[13px] text-event-assignment">
                <span className="font-semibold">23:59 · Assignment 3 is due</span>
              </div>
              <div className="rounded-md bg-event-quiz-soft px-2.5 py-1.5 text-[13px] text-event-quiz">
                <span className="font-semibold">Quiz 2 opens</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-[28px] ring-1 ring-border">
            <div className="flex w-72 gap-3 rounded-[14px] border-[1.5px] border-primary bg-card p-3.5 shadow-[0_0_28px_color-mix(in_srgb,var(--primary)_22%,transparent)]">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <BellIcon className="size-4" />
              </span>
              <div className="flex flex-col text-sm">
                <span className="font-semibold">Assignment 3 is due in 3 hours</span>
                <span className="text-muted-foreground">Software Engineering · 23:59</span>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Header() {
  const { resolved, setPreference } = useTheme();

  return (
    <header className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xl">
          <BrandMark className="size-6 text-primary" />
          <span className="type-wordmark">remoodle</span>
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`}
          onClick={() => setPreference(resolved === "dark" ? "light" : "dark")}
        >
          {resolved === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>
      <h1 className="type-display">Design system</h1>
      <p className="type-lead max-w-[620px] text-muted-foreground">
        Every token and primitive the calendar uses, themed from <code>DESIGN.md</code>.
      </p>
    </header>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="type-title">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Separator />
      {children}
    </section>
  );
}

const previewCourses = ["Algorithms", "Databases", "Calculus II"];

function SidebarPreview() {
  return (
    <SidebarProvider className="min-h-0 overflow-hidden rounded-3xl ring-1 ring-border">
      <Sidebar collapsible="none" className="h-[28rem]">
        <SidebarHeader>
          <span className="flex items-center gap-2 px-2 py-1.5 text-lg">
            <BrandMark className="size-5 text-primary" />
            <span className="type-wordmark">remoodle</span>
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <CalendarDaysIcon />
                    <span>Calendar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings2Icon />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Courses</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {previewCourses.map((course, index) => (
                  <SidebarMenuItem key={course}>
                    <SidebarMenuButton>
                      <ChevronRightIcon />
                      <span>{course}</span>
                    </SidebarMenuButton>
                    {index === 0 && (
                      <SidebarMenuSub>
                        {["Lectures", "Practice", "Online"].map((kind) => (
                          <SidebarMenuSubItem key={kind}>
                            <SidebarMenuSubButton asChild>
                              <button type="button">
                                <CheckIcon />
                                <span>{kind}</span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-1 flex-col gap-3 bg-background p-6 text-sm text-muted-foreground">
        <label className="flex items-center gap-2">
          <Checkbox defaultChecked /> Show My DU classes
        </label>
        <p>The canvas the calendar renders into. Press nothing here; hover the rows on the left.</p>
      </div>
    </SidebarProvider>
  );
}
