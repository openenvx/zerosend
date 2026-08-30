import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { AutomationNodeType } from '@zerosend/api/automations/graph-schema';
import { StatusDot } from '@zerosend/ui/components/status-dot';
import { cn } from '@zerosend/ui/lib/utils';
import { Clock3, GitBranch, Mail, Radio, Timer } from 'lucide-react';

interface AutomationNodeData {
  amount?: number;
  eventName?: string;
  field?: string;
  label?: string;
  operator?: string;
  subject?: string;
  templateId?: string;
  timeoutAmount?: number;
  timeoutUnit?: string;
  unit?: string;
  value?: string;
}

const nodeMeta: Record<
  AutomationNodeType,
  { icon: typeof Radio; title: string }
> = {
  condition: { icon: GitBranch, title: 'Conditional path' },
  delay: { icon: Timer, title: 'Time delay' },
  sendEmail: { icon: Mail, title: 'Send email' },
  trigger: { icon: Radio, title: 'Custom event' },
  waitForEvent: { icon: Clock3, title: 'Wait for event' },
};

function getSubtitle(type: AutomationNodeType, data: AutomationNodeData) {
  switch (type) {
    case 'trigger': {
      return data.eventName ?? 'Configure event';
    }
    case 'sendEmail': {
      return data.subject ?? 'Choose template';
    }
    case 'delay': {
      return `${data.amount ?? 0} ${data.unit ?? 'minutes'}`;
    }
    case 'waitForEvent': {
      return `${data.eventName ?? 'event'} · ${data.timeoutAmount ?? 0} ${data.timeoutUnit ?? 'hours'} max`;
    }
    case 'condition': {
      return `${data.field ?? 'field'} ${data.operator ?? 'equals'} ${data.value ?? ''}`.trim();
    }
    default: {
      return '';
    }
  }
}

function AutomationNodeCard({
  selected,
  subtitle,
  title,
  type,
}: {
  selected?: boolean;
  subtitle: string;
  title: string;
  type: AutomationNodeType;
}) {
  const Icon = nodeMeta[type].icon;

  return (
    <div
      className={cn(
        'bg-card border-border min-w-[220px] rounded-lg border px-3 py-2.5 shadow-none',
        selected && 'border-foreground/30 bg-muted/40'
      )}
    >
      <div className="flex items-start gap-2">
        <StatusDot className="mt-1.5" tone="active" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon className="text-muted-foreground size-3.5 shrink-0" />
            <p className="text-card-title truncate">{title}</p>
          </div>
          <p className="text-nav text-muted-foreground mt-1 truncate font-mono">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TriggerNode(props: NodeProps) {
  const data = props.data as AutomationNodeData;
  return (
    <>
      <AutomationNodeCard
        selected={props.selected}
        subtitle={getSubtitle('trigger', data)}
        title={nodeMeta.trigger.title}
        type="trigger"
      />
      <Handle
        className="!bg-muted-foreground !border-none"
        position={Position.Right}
        type="source"
      />
    </>
  );
}

export function SendEmailNode(props: NodeProps) {
  const data = props.data as AutomationNodeData;
  return (
    <>
      <Handle
        className="!bg-muted-foreground !border-none"
        position={Position.Left}
        type="target"
      />
      <AutomationNodeCard
        selected={props.selected}
        subtitle={getSubtitle('sendEmail', data)}
        title={nodeMeta.sendEmail.title}
        type="sendEmail"
      />
      <Handle
        className="!bg-muted-foreground !border-none"
        position={Position.Right}
        type="source"
      />
    </>
  );
}

export function DelayNode(props: NodeProps) {
  const data = props.data as AutomationNodeData;
  return (
    <>
      <Handle
        className="!bg-muted-foreground !border-none"
        position={Position.Left}
        type="target"
      />
      <AutomationNodeCard
        selected={props.selected}
        subtitle={getSubtitle('delay', data)}
        title={nodeMeta.delay.title}
        type="delay"
      />
      <Handle
        className="!bg-muted-foreground !border-none"
        position={Position.Right}
        type="source"
      />
    </>
  );
}

export function WaitForEventNode(props: NodeProps) {
  const data = props.data as AutomationNodeData;
  return (
    <>
      <Handle
        className="!bg-muted-foreground !border-none"
        position={Position.Left}
        type="target"
      />
      <AutomationNodeCard
        selected={props.selected}
        subtitle={getSubtitle('waitForEvent', data)}
        title={nodeMeta.waitForEvent.title}
        type="waitForEvent"
      />
      <Handle
        className="!bg-muted-foreground !border-none"
        id="received"
        position={Position.Right}
        style={{ top: '35%' }}
        type="source"
      />
      <Handle
        className="!bg-muted-foreground !border-none"
        id="timeout"
        position={Position.Right}
        style={{ top: '70%' }}
        type="source"
      />
    </>
  );
}

export function ConditionNode(props: NodeProps) {
  const data = props.data as AutomationNodeData;
  return (
    <>
      <Handle
        className="!bg-muted-foreground !border-none"
        position={Position.Left}
        type="target"
      />
      <AutomationNodeCard
        selected={props.selected}
        subtitle={getSubtitle('condition', data)}
        title={nodeMeta.condition.title}
        type="condition"
      />
      <Handle
        className="!bg-muted-foreground !border-none"
        id="true"
        position={Position.Right}
        style={{ top: '35%' }}
        type="source"
      />
      <Handle
        className="!bg-muted-foreground !border-none"
        id="false"
        position={Position.Right}
        style={{ top: '70%' }}
        type="source"
      />
    </>
  );
}

export const automationNodeTypes = {
  condition: ConditionNode,
  delay: DelayNode,
  sendEmail: SendEmailNode,
  trigger: TriggerNode,
  waitForEvent: WaitForEventNode,
};
