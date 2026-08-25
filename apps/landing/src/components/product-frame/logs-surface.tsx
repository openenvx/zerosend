const LOGS = [
  {
    from: 'billing@acme.dev',
    status: 'sent',
    subject: 'Invoice ready',
    time: '2m ago',
    to: 'ops@acme.dev',
  },
  {
    from: 'noreply@acme.dev',
    status: 'sent',
    subject: 'Password reset',
    time: '18m ago',
    to: 'maya@acme.dev',
  },
  {
    from: 'alerts@acme.dev',
    status: 'failed',
    subject: 'Usage warning',
    time: '1h ago',
    to: 'oncall@acme.dev',
  },
  {
    from: 'hello@acme.dev',
    status: 'sent',
    subject: 'Welcome to Acme',
    time: '3h ago',
    to: 'new@acme.dev',
  },
] as const;

export function LogsSurface() {
  return (
    <div className="bg-marketing-surface-base flex h-full flex-col">
      <div className="border-marketing-divider flex items-center justify-between border-b px-4 py-3">
        <p className="f-heading-sm text-paper-white">Logs</p>
        <p className="text-marketing-subtlest font-mono text-[10px]">
          Showing latest 4
        </p>
      </div>
      <div className="divide-marketing-divider min-h-0 flex-1 divide-y overflow-hidden">
        {LOGS.map((log) => (
          <div className="flex items-center gap-3 px-4 py-3" key={log.subject}>
            <span
              aria-hidden
              className={`size-1.5 shrink-0 rounded-full ${
                log.status === 'sent'
                  ? 'bg-electric-blue shadow-[0_0_8px_rgba(0,153,255,0.6)]'
                  : 'bg-marketing-subtler'
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-paper-white truncate text-[13px]">
                {log.subject}
              </p>
              <p className="text-marketing-subtlest truncate font-mono text-[10px]">
                {log.from} → {log.to}
              </p>
            </div>
            <span
              className={`shrink-0 font-mono text-[10px] ${
                log.status === 'sent'
                  ? 'text-electric-blue'
                  : 'text-marketing-subtler'
              }`}
            >
              {log.status}
            </span>
            <span className="text-marketing-subtlest hidden shrink-0 font-mono text-[10px] sm:block">
              {log.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
