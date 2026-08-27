import { Button } from '@zerosend/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zerosend/ui/components/dialog';
import { Input } from '@zerosend/ui/components/input';
import { Label } from '@zerosend/ui/components/label';
import { useEffect, useState } from 'react';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  defaultName?: string;
  isPending: boolean;
  onSubmit: (name: string) => void;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  mode,
  defaultName = '',
  isPending,
  onSubmit,
}: ProjectFormDialogProps) {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) {
      setName(defaultName);
    }
  }, [open, defaultName]);

  const trimmedName = name.trim();
  const isUnchanged = mode === 'edit' && trimmedName === defaultName.trim();

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'New project' : 'Rename project'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new project to organize API keys, templates, and logs.'
              : 'Update the name of the current project.'}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmedName === '' || isUnchanged) {
              return;
            }
            onSubmit(trimmedName);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              autoFocus
              id="project-name"
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
              placeholder="Project name"
              required
              value={name}
            />
          </div>

          <DialogFooter>
            <Button
              disabled={isPending || trimmedName === '' || isUnchanged}
              type="submit"
            >
              {mode === 'create' ? 'Create project' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
