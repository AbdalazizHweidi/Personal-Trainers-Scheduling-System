import { AuthTabs } from "@/components/auth-tabs";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[];
    redirect?: string | string[];
    tab?: string | string[];
    fullName?: string | string[];
    email?: string | string[];
  }>;
}) {
  const params = await searchParams;

  const toStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const error = toStr(params.error);
  const redirectTo = toStr(params.redirect);
  const tab = toStr(params.tab);
  const fullName = toStr(params.fullName);
  const email = toStr(params.email);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-10 py-5">
        <span className="font-display text-2xl tracking-wide text-foreground">FITCONNECT</span>
      </header>

      <div className="mx-auto grid min-h-[560px] max-w-5xl grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-between bg-foreground p-12 text-background md:p-[60px]">
          <span className="font-display text-2xl tracking-wide">FITCONNECT</span>
          <div className="font-display text-[32px] leading-[1.15]">
            Every session logged.
            <br />
            Every rep <span className="text-primary">counted.</span>
          </div>
          <p className="text-[13px] opacity-70">
            Members get faster booking, saved payment details, and a full session history.
          </p>
        </div>

        <div className="flex flex-col justify-center bg-background p-12 md:p-[60px]">
          <AuthTabs
            redirectTo={redirectTo ?? "/dashboard"}
            initialTab={tab === "signup" ? "signup" : "login"}
            error={error}
            defaultFullName={fullName}
            defaultEmail={email}
          />
        </div>
      </div>
    </div>
  );
}