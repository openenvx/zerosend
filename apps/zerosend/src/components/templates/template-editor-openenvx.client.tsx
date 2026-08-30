'use client';

import { EmailEditor, type Scene } from '@openenvx/email-studio';
import { useCallback, useMemo, useRef } from 'react';

import '@openenvx/email-studio/theme.css';

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
    // ignore invalid scene JSON
  }
}

export interface TemplateEditorOpenenvxProps {
  editorTitle: string;
  onSaveScene: (sceneJson: string) => void;
  sceneJson: string;
  templateId: string;
}

export function TemplateEditorOpenenvx({
  editorTitle,
  onSaveScene,
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

  return (
    <EmailEditor
      className="openenvx-email-editor h-full min-h-0 w-full"
      editorTitle={editorTitle}
      initialScene={initialScene}
      key={templateId}
      onChange={queueSave}
      theme="dark"
    />
  );
}
