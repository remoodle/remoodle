import type { ComponentProps, ReactNode } from "react";
import { cn } from "cn";

/** A settings block: slots own their layout, the page stacks them on hairlines. */
export function SettingsSection({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("flex flex-col gap-5 py-8 first:pt-0", className)} {...props} />;
}

export function SettingsSectionHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  // Status shown beside the title, such as a badge.
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function SettingsSectionActions({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)} {...props} />;
}
