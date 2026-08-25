import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ArrowRight, BookOpen, Mail, Server } from "lucide-react";

import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-16">
        <div className="space-y-4 text-center">
          <p className="text-fd-muted-foreground text-sm uppercase tracking-[0.2em]">
            Self-hosted email
          </p>
          <h1 className="text-balance font-semibold text-4xl tracking-tight md:text-5xl">
            Send email from your stack without another SaaS bill
          </h1>
          <p className="mx-auto max-w-2xl text-fd-muted-foreground text-lg text-pretty">
            Zerosend is a single Cloudflare Worker: operator dashboard, REST
            API, and docs. Your products call it like Resend — with keys you
            control.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-4 py-2.5 font-medium text-fd-primary-foreground text-sm"
            to="/docs/$"
            params={{ _splat: "" }}
          >
            Read the docs
            <BookOpen className="size-4" />
          </Link>
          <a
            className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-4 py-2.5 font-medium text-sm"
            href="/docs/getting-started"
          >
            Get started
            <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Feature
            description="Dashboard, /v1 REST, and queue handlers in one deploy."
            icon={Server}
            title="One Worker"
          />
          <Feature
            description="Product apps authenticate with Bearer API keys — no user accounts."
            icon={Mail}
            title="Simple API"
          />
          <Feature
            description="Operator UI uses a single admin token. Keys stay on the server lane."
            icon={BookOpen}
            title="EmailFlare-style auth"
          />
        </div>
      </div>
    </HomeLayout>
  );
}

function Feature({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof Server;
}) {
  return (
    <div className="rounded-xl border border-fd-border bg-fd-card p-4 text-left">
      <Icon className="mb-3 size-5 text-fd-primary" />
      <h2 className="font-medium text-sm">{title}</h2>
      <p className="mt-1 text-fd-muted-foreground text-sm">{description}</p>
    </div>
  );
}
