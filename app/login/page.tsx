import { AuthTabs } from "@/components/auth-tabs";
import { fontVars } from "@/lib/fonts";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string; tab?: string }>;
}) {
  const { error, redirect: redirectTo, tab } = await searchParams;

  return (
    <div
      className={`${fontVars} min-h-screen`}
      style={{ background: "#eceee8", fontFamily: "var(--font-body)", color: "#171b1f" }}
    >
      <div className="mx-auto grid min-h-[560px] max-w-5xl grid-cols-1 md:grid-cols-2">
        <div
          className="flex flex-col justify-between p-[60px] text-white"
          style={{ background: "#171b1f" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-[26px] items-end gap-[3px]">
              <span className="block w-1.5 bg-[#ff5a1f]" style={{ height: 12 }} />
              <span className="block w-1.5 bg-white" style={{ height: 22 }} />
              <span className="block w-1.5 bg-[#ff5a1f]" style={{ height: 16 }} />
            </div>
            <span className="text-[26px] tracking-[0.03em]" style={{ fontFamily: "var(--font-display)" }}>
              FITCONNECT
            </span>
          </div>
          <div className="max-w-[380px] text-[32px] leading-[1.15]" style={{ fontFamily: "var(--font-display)" }}>
            Every session logged.
            <br />
            Every rep <span style={{ color: "#ff5a1f" }}>counted.</span>
          </div>
          <p className="text-[13px]" style={{ color: "#9aa0a6" }}>
            Members get faster booking, saved payment details, and a full session history.
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center p-[60px]">
          <AuthTabs
            redirectTo={redirectTo ?? "/dashboard"}
            initialTab={tab === "signup" ? "signup" : "login"}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}