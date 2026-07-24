import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const { error, redirect: redirectTo } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-6">
      <h1 className="font-display text-3xl text-foreground">Log in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back to FitConnect.</p>

      {error && (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <form action={login} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="redirect" value={redirectTo ?? "/dashboard"} />

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            defaultValue="test@fitconnect.dev"
            className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-card-foreground outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            defaultValue="test1234"
            className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-card-foreground outline-none"
          />
        </div>

        <button
          type="submit"
          className="mt-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Log in
        </button>
      </form>
    </div>
  );
}