import { getRouteApi } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@zerosend/ui/components/avatar";
import { Button } from "@zerosend/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@zerosend/ui/components/dropdown-menu";
import { cn } from "@zerosend/ui/lib/utils";
import { ChevronDownIcon } from "lucide-react";

const authedRoute = getRouteApi("/_authed");
const workspaceName = "Zerosend";

interface UserMenuProps {
  variant?: "default" | "sidebar";
  collapsed?: boolean;
}

export function UserMenu({
  variant = "default",
  collapsed = false,
}: UserMenuProps) {
  const { principal } = authedRoute.useLoaderData();
  const isCollapsed = variant === "sidebar" && collapsed;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Open workspace menu"
            className={cn(
              variant === "sidebar" &&
                "h-8 w-full justify-start gap-2 rounded-md border border-border px-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
              variant === "default" && "rounded-full"
            )}
            size={variant === "sidebar" && !isCollapsed ? "sm" : "icon-sm"}
            title={isCollapsed ? workspaceName : undefined}
            type="button"
            variant="ghost"
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            {workspaceName.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        {variant === "sidebar" ? (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-nav text-foreground group-data-[collapsible=icon]:hidden">
              {workspaceName}
            </span>
            <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
          </>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === "sidebar" ? "start" : "end"}
        className="w-56 bg-card"
        side="bottom"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>{principal.id}</DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            variant="destructive"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
