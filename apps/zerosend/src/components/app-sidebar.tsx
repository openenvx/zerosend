import { Link, useRouterState } from '@tanstack/react-router';
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
  SidebarSeparator,
} from '@zerosend/ui/components/sidebar';
import { sidebarNavButtonClassName } from '@zerosend/ui/components/sidebar-nav-styles';
import { cn } from '@zerosend/ui/lib/utils';
import {
  FileText,
  Globe,
  Inbox,
  KeyIcon,
  ScrollText,
  SearchIcon,
  Workflow,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { UserMenu } from './user-menu';

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
    label: 'Logs',
    to: '/logs',
  },
  {
    icon: <Inbox size={16} />,
    label: 'Mailbox',
    to: '/mailbox',
  },
  {
    icon: <Globe size={16} />,
    label: 'Domains',
    to: '/domains',
  },
  {
    icon: <FileText size={16} />,
    label: 'Templates',
    to: '/templates',
  },
  {
    icon: <Workflow size={16} />,
    label: 'Automations',
    to: '/automations',
  },
];

const settingsNavItems: NavItem[] = [
  {
    icon: <KeyIcon size={16} />,
    label: 'API keys',
    to: '/settings',
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
                'cursor-not-allowed opacity-40'
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

function SidebarSearch() {
  function handleOpenPalette() {
    toast.message('Search coming soon', {
      description: 'Find a log or template from the command palette.',
    });
  }

  return (
    <button
      className={cn(
        'border-sidebar-border bg-input/40 text-nav text-muted-foreground flex h-8 w-full items-center gap-2 rounded-md border px-2 outline-none',
        'hover:bg-input/60 focus-visible:border-ring focus-visible:border'
      )}
      onClick={handleOpenPalette}
      type="button"
    >
      <SearchIcon className="size-3.5 shrink-0" />
      <span className="min-w-0 flex-1 text-left">Search</span>
      <kbd className="bg-muted text-muted-foreground rounded px-1 text-[10px] tracking-wide">
        ⌘K
      </kbd>
    </button>
  );
}

export function AppSidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <Sidebar className="border-sidebar-border border-r" collapsible="none">
      <SidebarHeader className="gap-3 px-2 py-2">
        <UserMenu variant="sidebar" />
        <SidebarSearch />
      </SidebarHeader>

      <SidebarContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden px-2 py-2">
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

      <SidebarFooter className="p-2" />
    </Sidebar>
  );
}
