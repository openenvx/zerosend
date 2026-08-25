const LINES = [
  { code: `await fetch(\${ZEROSEND_URL}/v1/emails\`, {`, tone: 'code' },
  { code: '  method: "POST",', tone: 'code' },
  { code: '  headers: {', tone: 'code' },
  { code: `    Authorization: \`Bearer \${API_KEY}\`,`, tone: 'value' },
  { code: '  },', tone: 'code' },
  { code: '  body: JSON.stringify({', tone: 'code' },
  { code: '    to: "ops@acme.dev",', tone: 'value' },
  { code: '    subject: "Invoice ready",', tone: 'value' },
  { code: '    html: "<p>Your invoice.</p>",', tone: 'value' },
  { code: '  }),', tone: 'code' },
  { code: '});', tone: 'code' },
] as const;

export function ApiSurface() {
  return (
    <div className="bg-marketing-surface-base flex h-full flex-col">
      <div className="border-marketing-divider flex items-center gap-2 border-b px-4 py-2.5">
        <span className="bg-marketing-surface-raised text-electric-blue rounded-md px-2 py-1 font-mono text-[11px]">
          POST
        </span>
        <span className="text-paper-white font-mono text-[12px]">
          /v1/emails
        </span>
        <span className="text-marketing-subtlest ml-auto font-mono text-[10px]">
          send.ts
        </span>
      </div>
      <pre className="overflow-hidden p-5 font-mono text-[12px] leading-[1.85] sm:p-6 sm:text-[13px]">
        <code>
          {LINES.map((line, index) => (
            <span className="flex" key={line.code}>
              <span className="text-marketing-subtlest w-8 shrink-0 pr-4 text-right select-none">
                {index + 1}
              </span>
              <span
                className={
                  line.tone === 'value'
                    ? 'text-electric-blue'
                    : 'text-paper-white/90'
                }
              >
                {line.code}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
