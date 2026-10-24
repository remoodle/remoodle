import type { ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { Temporal } from "temporal-polyfill";
import { cn } from "cn";
import { CalendarDaysIcon, CheckIcon, ChevronRightIcon, Settings2Icon } from "lucide-react";
import { defaultCourseFilter, type CourseScheduleFilter } from "@remoodle/shared/schedule";
import { BrandMark } from "@/components/brand-mark";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useFilters } from "@/hooks/use-filters";
import { fromDate, toDate, today } from "@/lib/calendar-dates";
import type { EventKind } from "@/lib/calendar-events";
import { eventKinds } from "@/lib/event-kinds";
import { ExportDialog } from "./export-dialog";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <Link
          to="/calendar"
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-lg outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring"
        >
          <BrandMark className="size-5 text-primary" />
          <span className="type-wordmark">remoodle</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/calendar"}>
                  <Link to="/calendar">
                    <CalendarDaysIcon />
                    <span>Calendar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                  <Link to="/settings">
                    <Settings2Icon />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <MonthPicker />
        <CalendarsGroup />
        <CoursesGroup />
      </SidebarContent>
      <SidebarFooter>
        <ExportDialog />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function MonthPicker() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const selected = search.date ? Temporal.PlainDate.from(search.date) : today();

  return (
    <SidebarGroup>
      <Calendar
        mode="single"
        weekStartsOn={1}
        selected={toDate(selected)}
        defaultMonth={toDate(selected)}
        onSelect={(date) => {
          if (!date) return;

          void navigate({
            to: "/calendar",
            search: (previous) => ({ ...previous, date: fromDate(date).toString() }),
          });
        }}
        className="w-full"
      />
    </SidebarGroup>
  );
}

// A row that shows or hides one calendar; the check marks it visible.
function CalendarToggle({
  kinds,
  visible,
  onToggle,
  children,
}: {
  kinds: EventKind[];
  visible: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton aria-pressed={visible} onClick={onToggle}>
        <span className="flex w-4 shrink-0 justify-center -space-x-1">
          {kinds.map((kind) => (
            <span
              key={kind}
              className={cn("size-2 rounded-full ring-2 ring-sidebar", eventKinds[kind].dot)}
            />
          ))}
        </span>
        <span className={cn("flex-1", !visible && "text-muted-foreground line-through")}>
          {children}
        </span>
        <CheckIcon className={cn(!visible && "invisible")} />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function ConnectRow({ children }: { children: ReactNode }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link to="/settings">
          <span className="flex-1 text-muted-foreground">{children}</span>
          <span className="text-xs text-primary">Connect</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function CalendarsGroup() {
  const { myDu, moodle } = useCalendarEvents();
  const { filters, setFilters } = useFilters();

  const toggleMoodle = (key: keyof typeof filters.moodle) =>
    setFilters((current) => ({
      ...current,
      moodle: { ...current.moodle, [key]: !current.moodle[key] },
    }));

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Calendars</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {myDu.data?.connection ? (
            <CalendarToggle
              kinds={["lecture", "online", "practice"]}
              visible={filters.classes !== false}
              onToggle={() =>
                setFilters((current) => ({ ...current, classes: current.classes === false }))
              }
            >
              My DU classes
            </CalendarToggle>
          ) : (
            myDu.isSuccess && <ConnectRow>My DU classes</ConnectRow>
          )}
          {moodle.isPending && <SidebarMenuSkeleton />}
          {moodle.data?.connected && (
            <>
              <CalendarToggle
                kinds={["assignment"]}
                visible={filters.moodle.assignment}
                onToggle={() => toggleMoodle("assignment")}
              >
                Assignments
              </CalendarToggle>
              <CalendarToggle
                kinds={["quiz"]}
                visible={filters.moodle.other}
                onToggle={() => toggleMoodle("other")}
              >
                Quizzes and events
              </CalendarToggle>
              <CalendarToggle
                kinds={["attendance"]}
                visible={filters.moodle.attendance}
                onToggle={() => toggleMoodle("attendance")}
              >
                Attendance
              </CalendarToggle>
            </>
          )}
          {moodle.data && !moodle.data.connected && <ConnectRow>Moodle deadlines</ConnectRow>}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

const courseKinds = [
  ["lecture", "Lectures"],
  ["practice", "Practice"],
  ["online", "Online"],
  ["offline", "In person"],
] as const satisfies [keyof CourseScheduleFilter, string][];

function CoursesGroup() {
  const { courses } = useCalendarEvents();
  const { filters, setFilters } = useFilters();

  if (courses.length === 0) return null;

  const update = (course: string, key: keyof CourseScheduleFilter) =>
    setFilters((current) => {
      const filter = current.courses[course] ?? defaultCourseFilter();

      return {
        ...current,
        courses: { ...current.courses, [course]: { ...filter, [key]: !filter[key] } },
      };
    });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Courses</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {courses.map((course) => {
            const filter = filters.courses[course] ?? defaultCourseFilter();

            return (
              <Collapsible key={course} asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <ChevronRightIcon className="transition-transform duration-130 group-data-[state=open]/collapsible:rotate-90" />
                      <span className={cn(!filter.enabled && "text-muted-foreground line-through")}>
                        {course}
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <button
                            type="button"
                            aria-pressed={filter.enabled}
                            onClick={() => update(course, "enabled")}
                          >
                            <CheckIcon className={cn(!filter.enabled && "invisible")} />
                            <span>Show course</span>
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {courseKinds.map(([key, label]) => (
                        <SidebarMenuSubItem key={key}>
                          <SidebarMenuSubButton asChild>
                            <button
                              type="button"
                              disabled={!filter.enabled}
                              aria-pressed={filter[key]}
                              onClick={() => update(course, key)}
                            >
                              <CheckIcon className={cn(!filter[key] && "invisible")} />
                              <span>{label}</span>
                            </button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
