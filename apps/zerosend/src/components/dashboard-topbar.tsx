import { SidebarTrigger } from "@zerosend/ui/components/sidebar";

/** Sticky inset top bar with sidebar toggle. */
export function DashboardTopbar() {
  return (
    <header className="@container sticky top-0 z-50 flex h-10 shrink-0 items-center gap-2 bg-void px-4 md:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground" />
    </header>
  );
}
