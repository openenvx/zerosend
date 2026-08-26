import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import { Avatar, AvatarFallback } from '@zerosend/ui/components/avatar';
import { Button } from '@zerosend/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@zerosend/ui/components/dropdown-menu';
import { Input } from '@zerosend/ui/components/input';
import { cn } from '@zerosend/ui/lib/utils';
import { Check, ChevronDownIcon, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { orpc } from '@/utils/orpc';

const authedRoute = getRouteApi('/_authed');

interface UserMenuProps {
  variant?: 'default' | 'sidebar';
  collapsed?: boolean;
}

export function UserMenu({
  variant = 'default',
  collapsed = false,
}: UserMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentProject, projects } = authedRoute.useLoaderData();
  const isCollapsed = variant === 'sidebar' && collapsed;
  const [creating, setCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(currentProject.name);

  const setCurrentProject = useMutation(
    orpc.projects.setCurrent.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        await router.invalidate();
        queryClient.clear();
      },
    })
  );

  const createProject = useMutation(
    orpc.projects.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async (project) => {
        await setCurrentProject.mutateAsync({ id: project.id });
        setCreating(false);
        setNewProjectName('');
        toast.success(`Created ${project.name}`);
      },
    })
  );

  const updateProject = useMutation(
    orpc.projects.update.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        setRenaming(false);
        await router.invalidate();
        toast.success('Project renamed');
      },
    })
  );

  function handleSwitchProject(projectId: string) {
    if (projectId === currentProject.id) {
      return;
    }

    setCurrentProject.mutate({ id: projectId });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Open project menu"
            className={cn(
              variant === 'sidebar' &&
                'border-border h-8 w-full justify-start gap-2 rounded-md border px-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
              variant === 'default' && 'rounded-full'
            )}
            size={variant === 'sidebar' && !isCollapsed ? 'sm' : 'icon-sm'}
            title={isCollapsed ? currentProject.name : undefined}
            type="button"
            variant="ghost"
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {currentProject.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        {variant === 'sidebar' ? (
          <>
            <span className="text-nav text-foreground min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
              {currentProject.name}
            </span>
            <ChevronDownIcon className="text-muted-foreground size-3.5 shrink-0 group-data-[collapsible=icon]:hidden" />
          </>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === 'sidebar' ? 'start' : 'end'}
        className="bg-card w-64"
        side="bottom"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Projects</DropdownMenuLabel>
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => handleSwitchProject(project.id)}
            >
              <span className="min-w-0 flex-1 truncate">{project.name}</span>
              {project.id === currentProject.id ? (
                <Check className="text-muted-foreground size-4 shrink-0" />
              ) : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {creating ? (
            <div className="space-y-2 px-2 py-1.5">
              <Input
                autoFocus
                onChange={(event) => setNewProjectName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setCreating(false);
                    setNewProjectName('');
                  }
                }}
                placeholder="Project name"
                value={newProjectName}
              />
              <Button
                className="w-full"
                disabled={
                  createProject.isPending || newProjectName.trim() === ''
                }
                onClick={() => {
                  createProject.mutate({ name: newProjectName.trim() });
                }}
                size="sm"
                type="button"
              >
                Create project
              </Button>
            </div>
          ) : (
            <DropdownMenuItem onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              New project
            </DropdownMenuItem>
          )}
          {renaming ? (
            <div className="space-y-2 px-2 py-1.5">
              <Input
                autoFocus
                onChange={(event) => setRenameValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setRenaming(false);
                    setRenameValue(currentProject.name);
                  }
                }}
                value={renameValue}
              />
              <Button
                className="w-full"
                disabled={updateProject.isPending || renameValue.trim() === ''}
                onClick={() => {
                  updateProject.mutate({
                    id: currentProject.id,
                    name: renameValue.trim(),
                  });
                }}
                size="sm"
                type="button"
              >
                Save name
              </Button>
            </div>
          ) : (
            <DropdownMenuItem
              onClick={() => {
                setRenameValue(currentProject.name);
                setRenaming(true);
              }}
            >
              <Pencil className="size-4" />
              Rename current
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
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
