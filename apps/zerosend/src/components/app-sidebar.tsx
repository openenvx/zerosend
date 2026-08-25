import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@zerosend/ui/components/button";
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
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@zerosend/ui/components/sidebar";
import { sidebarNavButtonClassName } from "@zerosend/ui/components/sidebar-nav-styles";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@zerosend/ui/components/tooltip";
import { cn } from "@zerosend/ui/lib/utils";
import {
  FileText,
  KeyIcon,
  ScrollText,
  SearchIcon,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { UserMenu } from "./user-menu";

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  exact?: boolean;
  disabled?: boolean;
}

const primaryNavItems: NavItem[] = [
  {
    exact: true,
    icon: <ScrollText size={16} />,
    label: "Logs",
    to: "/",
  },
  {
    disabled: true,
    icon: <FileText size={16} />,
    label: "Templates",
    to: "/templates",
  },
  {
    disabled: true,
    icon: <Workflow size={16} />,
    label: "Automations",
    to: "/automations",
  },
];

const settingsNavItems: NavItem[] = [
  {
    icon: <KeyIcon size={16} />,
    label: "API keys",
    to: "/settings",
  },
];

function isNavActive(pathname: string, item: NavItem) {
  if (item.disabled) {
    return false;
  }

  return item.exact ? pathname === item.to : pathname.startsWith(item.to);
}

function NavList({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.label}>
          {item.disabled ? (
            <SidebarMenuButton
              className={cn(
                sidebarNavButtonClassName,
                "cursor-not-allowed opacity-40"
              )}
              disabled
              size="sm"
              tooltip={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              className={sidebarNavButtonClassName}
              isActive={isNavActive(pathname, item)}
              render={<Link to={item.to} />}
              size="sm"
              tooltip={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function SidebarSearch({ collapsed }: { collapsed: boolean }) {
  function handleOpenPalette() {
    toast.message("Search coming soon", {
      description: "Find a log or template once Phase 2 ships.",
    });
  }

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label="Search"
              className="size-8"
              onClick={handleOpenPalette}
              size="icon-sm"
              type="button"
              variant="ghost"
            />
          }
        >
          <SearchIcon />
        </TooltipTrigger>
        <TooltipContent side="right">
          Search
          <kbd className="ml-1 rounded bg-background/20 px-1 text-[10px]">
            ⌘K
          </kbd>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-md border border-sidebar-border bg-input/40 px-2 text-nav text-muted-foreground outline-none",
        "hover:bg-input/60 focus-visible:border focus-visible:border-ring"
      )}
      onClick={handleOpenPalette}
      type="button"
    >
      <SearchIcon className="size-3.5 shrink-0" />
      <span className="min-w-0 flex-1 text-left">Search</span>
      <kbd className="rounded bg-muted px-1 text-[10px] tracking-wide text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  );
}

export function AppSidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-sidebar-border" collapsible="icon">
      <SidebarHeader className="gap-3 px-2 py-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <UserMenu collapsed={collapsed} variant="sidebar" />
        <SidebarSearch collapsed={collapsed} />
      </SidebarHeader>

      <SidebarContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden px-2 py-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <SidebarGroup className="shrink-0 p-0">
          <SidebarGroupLabel className="sr-only">Primary</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={primaryNavItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-0 my-3 opacity-50" />

        <SidebarGroup className="shrink-0 p-0">
          <SidebarGroupLabel className="sr-only">Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={settingsNavItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 group-data-[collapsible=icon]:px-2" />

      <SidebarRail />
    </Sidebar>
  );
}
