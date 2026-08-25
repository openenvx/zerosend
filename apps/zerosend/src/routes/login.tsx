import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { Button } from '@zerosend/ui/components/button';
import { Input } from '@zerosend/ui/components/input';
import { Label } from '@zerosend/ui/components/label';
import { useState } from 'react';

import { getSession } from '@/lib/session';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  loader: async () => {
    const session = await getSession();
    if (session.authenticated) {
      throw redirect({ to: '/' });
    }
  },
});

function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh items-center justify-center px-6 py-12">
      <LoginForm />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        body: JSON.stringify({ token }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const body = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !body.ok) {
        setError(body.error ?? 'Invalid admin token');
        return;
      }

      await router.invalidate();
      await router.navigate({ to: '/' });
    } catch {
      setError('Invalid admin token');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-card ring-border w-full max-w-sm rounded-[var(--radius-panel)] p-6 ring-1">
      <div className="mb-6 space-y-2 text-center">
        <div className="text-card-title mx-auto flex size-10 items-center justify-center rounded-[var(--radius-nav)] bg-[var(--color-module-hover)]">
          Z
        </div>
        <h1 className="text-section text-foreground">Sign in to Zerosend</h1>
        <p className="text-body text-muted-foreground">
          Enter your admin token to access the operator dashboard.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="admin-token">Admin token</Label>
          <Input
            autoComplete="current-password"
            id="admin-token"
            onChange={(event) => setToken(event.target.value)}
            placeholder="ADMIN_TOKEN"
            required
            type="password"
            value={token}
          />
        </div>
        {error ? (
          <p className="text-body text-[var(--status-failed)]" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="w-full" disabled={pending} type="submit">
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
