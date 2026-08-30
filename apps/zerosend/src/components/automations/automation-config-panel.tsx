import type { Node } from '@xyflow/react';
import { Button } from '@zerosend/ui/components/button';
import { Input } from '@zerosend/ui/components/input';
import { Label } from '@zerosend/ui/components/label';

interface TemplateOption {
  id: string;
  name: string;
}

interface AutomationConfigPanelProps {
  node: Node | null;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, data: Record<string, unknown>) => void;
  templates: TemplateOption[];
}

const selectClassName =
  'border-input bg-background text-body h-9 w-full rounded-md border px-3 outline-none focus-visible:border-ring';

export function AutomationConfigPanel({
  node,
  onDeleteNode,
  onUpdateNode,
  templates,
}: AutomationConfigPanelProps) {
  if (!node) {
    return (
      <div className="border-border bg-card text-muted-foreground flex h-full flex-col justify-center rounded-lg border p-4 text-sm">
        Select a step to configure it.
      </div>
    );
  }

  const data = node.data as Record<string, unknown>;

  function update(patch: Record<string, unknown>) {
    onUpdateNode(node.id, { ...data, ...patch });
  }

  return (
    <div className="border-border bg-card flex h-full flex-col rounded-lg border">
      <div className="border-border border-b px-4 py-3">
        <p className="text-card-title capitalize">{String(node.type)}</p>
        <p className="text-nav text-muted-foreground font-mono">{node.id}</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {node.type === 'trigger' ? (
          <div className="space-y-2">
            <Label htmlFor="trigger-event">Event name</Label>
            <Input
              id="trigger-event"
              onChange={(event) => update({ eventName: event.target.value })}
              placeholder="user.signup"
              value={String(data.eventName ?? '')}
            />
          </div>
        ) : null}

        {node.type === 'sendEmail' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="send-template">Template</Label>
              <select
                className={selectClassName}
                id="send-template"
                onChange={(event) => update({ templateId: event.target.value })}
                value={String(data.templateId ?? '')}
              >
                <option value="">Choose template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="send-subject">Subject</Label>
              <Input
                id="send-subject"
                onChange={(event) => update({ subject: event.target.value })}
                value={String(data.subject ?? '')}
              />
            </div>
          </>
        ) : null}

        {node.type === 'delay' ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="delay-amount">Amount</Label>
              <Input
                id="delay-amount"
                min={1}
                onChange={(event) =>
                  update({ amount: Number(event.target.value) || 1 })
                }
                type="number"
                value={Number(data.amount ?? 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delay-unit">Unit</Label>
              <select
                className={selectClassName}
                id="delay-unit"
                onChange={(event) => update({ unit: event.target.value })}
                value={String(data.unit ?? 'minutes')}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
          </div>
        ) : null}

        {node.type === 'waitForEvent' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="wait-event">Event name</Label>
              <Input
                id="wait-event"
                onChange={(event) => update({ eventName: event.target.value })}
                value={String(data.eventName ?? '')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="wait-timeout-amount">Timeout</Label>
                <Input
                  id="wait-timeout-amount"
                  min={1}
                  onChange={(event) =>
                    update({ timeoutAmount: Number(event.target.value) || 1 })
                  }
                  type="number"
                  value={Number(data.timeoutAmount ?? 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wait-timeout-unit">Unit</Label>
                <select
                  className={selectClassName}
                  id="wait-timeout-unit"
                  onChange={(event) =>
                    update({ timeoutUnit: event.target.value })
                  }
                  value={String(data.timeoutUnit ?? 'hours')}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>
          </>
        ) : null}

        {node.type === 'condition' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="condition-field">Payload field</Label>
              <Input
                id="condition-field"
                onChange={(event) => update({ field: event.target.value })}
                placeholder="plan"
                value={String(data.field ?? '')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition-operator">Operator</Label>
              <select
                className={selectClassName}
                id="condition-operator"
                onChange={(event) => update({ operator: event.target.value })}
                value={String(data.operator ?? 'equals')}
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not equals</option>
                <option value="contains">Contains</option>
                <option value="exists">Exists</option>
              </select>
            </div>
            {data.operator !== 'exists' ? (
              <div className="space-y-2">
                <Label htmlFor="condition-value">Value</Label>
                <Input
                  id="condition-value"
                  onChange={(event) => update({ value: event.target.value })}
                  value={String(data.value ?? '')}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {node.type !== 'trigger' ? (
        <div className="border-border border-t p-4">
          <Button
            onClick={() => onDeleteNode(node.id)}
            type="button"
            variant="destructive"
          >
            Delete step
          </Button>
        </div>
      ) : null}
    </div>
  );
}
