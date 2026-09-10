import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess?: () => void;
}

/**
 * Session-based authentication form view for creator and organization login.
 *
 * Collects user email and password credentials, validates presence of required fields,
 * calls `api.login`, triggers workspace state hydration via `refreshWorkspace()`, and
 * notifies parent callers via `onLoginSuccess` on success. Renders inline error alerts
 * on failure and disables form submission while network requests are in-flight.
 *
 * State & Side Effects:
 * - Mutates local `email`, `password`, `isLoading`, and `error` states.
 * - Triggers backend session cookie / token creation via `api.login` and workspace context reload.
 *
 * @param props.onLoginSuccess - Optional callback executed after successful credential validation
 *   and workspace session refresh.
 */
export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const { api, refreshWorkspace } = useWorkspace();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await api.login({ email: email.trim(), password });
      await refreshWorkspace();
      onLoginSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 antialiased">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="size-10 rounded-lg bg-foreground flex items-center justify-center text-background font-black text-lg tracking-tighter mb-3 shadow-sm">
            P
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sign In to Postiz
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access your publishing workspace with session authentication
          </p>
        </div>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Mail className="size-3.5 text-muted-foreground" />
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="creator@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Lock className="size-3.5 text-muted-foreground" />
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-medium"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Protected by session-based authentication. Organization credentials stay server-side.
        </p>
      </div>
    </div>
  );
}
