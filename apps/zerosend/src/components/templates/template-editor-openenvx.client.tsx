'use client';

import { EmailEditor, type Scene } from '@openenvx/email';
import { Button } from '@zerosend/ui/components/button';
import { Loader2 } from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';

import '@openenvx/email/theme.css';

const SAVE_DEBOUNCE_MS = 1000;

function parseScene(sceneJson: string): Scene | undefined {
  if (!sceneJson.trim()) {
    return;
  }
  try {
    const parsed = JSON.parse(sceneJson) as Scene;
    if (typeof parsed.schemaVersion !== 'number') {
      return;
    }
    return parsed;
  } catch {
    return;
  }
}

export interface TemplateEditorOpenenvxProps {
  editorTitle: string;
  onPublish: (sceneJson: string) => void;
  onSaveScene: (sceneJson: string) => void;
  publishPending?: boolean;
  sceneJson: string;
  templateId: string;
}

export function TemplateEditorOpenenvx({
  editorTitle,
  onPublish,
  onSaveScene,
  publishPending = false,
  sceneJson,
  templateId,
}: TemplateEditorOpenenvxProps) {
  const initialScene = useMemo(() => parseScene(sceneJson), [sceneJson]);
  const sceneRef = useRef<Scene | undefined>(initialScene);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueSave = useCallback(
    (scene: Scene) => {
      sceneRef.current = scene;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        onSaveScene(JSON.stringify(scene));
      }, SAVE_DEBOUNCE_MS);
    },
    [onSaveScene]
  );

  const handlePublish = useCallback(() => {
    if (sceneRef.current) {
      onPublish(JSON.stringify(sceneRef.current));
    }
  }, [onPublish]);

  const busy = publishPending;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex justify-end">
        <Button disabled={busy} onClick={handlePublish} type="button">
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          Publish
        </Button>
      </div>
      <EmailEditor
        className="openenvx-email-editor min-h-[50vh] flex-1"
        editorTitle={editorTitle}
        initialScene={initialScene}
        key={templateId}
        onChange={queueSave}
        theme="dark"
      />
    </div>
  );
}
