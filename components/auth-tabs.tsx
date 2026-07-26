"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { login, signup } from "@/app/login/actions";

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

function SignupSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="h-11 w-full rounded-xl bg-[#10b981] text-base font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? "Creating account..." : "Sign up"}
    </button>
  );
}

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: "Not entered" };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: "Weak" };
  if (score <= 3) return { score, label: "Medium" };
  return { score, label: "Strong" };
}

export function AuthTabs({
  redirectTo,
  initialTab = "login",
  error,
  defaultFullName,
  defaultEmail,
}: {
  redirectTo: string;
  initialTab?: "login" | "signup";
  error?: string;
  defaultFullName?: string;
  defaultEmail?: string;
}) {
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;
  const canSubmitSignup = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordStrength = getPasswordStrength(password);
  const passwordStrengthPercent = (passwordStrength.score / 4) * 100;

  return (
    <div
      className={
        tab === "signup"
          ? "mx-auto w-full max-w-[420px] rounded-2xl border border-[#e8ecf4] bg-white p-6 shadow-[0_24px_48px_-28px_rgba(16,185,129,0.35)] sm:p-8"
          : "mx-auto w-full max-w-[420px] rounded-2xl border border-[#eef1f6] bg-white p-6 shadow-[0_20px_40px_-24px_rgba(255,90,31,0.45)] sm:p-8"
      }
    >
      {tab === "login" && (
        <div className="mb-5 text-center">
          <p className="font-mono text-[11px] font-semibold tracking-[0.38em] text-primary">FITCONNECT</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your bookings and schedule.</p>
        </div>
      )}

      {tab === "signup" && (
        <div className="mb-5 text-center">
          <h1 className="w-full whitespace-nowrap text-center text-3xl font-semibold tracking-tight text-[#0f1d3d] sm:text-4xl lg:text-[42px]">Create an account</h1>
          <p className="mt-2 text-sm text-[#4f6488]">Sign up to book and manage your training sessions.</p>
        </div>
      )}


      <div className={tab === "login" ? "mb-6 flex border-b border-border" : "mb-6 flex border-b border-[#d9e1ef]"}>
        <button
          type="button"
          onClick={() => setTab("login")}
          className="mr-6 pb-2.5 pt-2.5 text-sm font-semibold"
          style={{ borderBottom: `2px solid ${tab === "login" ? "#ff5a1f" : "transparent"}` }}
        >
          <span className={tab === "login" ? "text-foreground" : "text-[#6f81a0]"}>Log in</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className="pb-2.5 pt-2.5 text-sm font-semibold"
          style={{ borderBottom: `2px solid ${tab === "signup" ? "#ff5a1f" : "transparent"}` }}
        >
          <span className={tab === "signup" ? "text-[#111f3f]" : "text-muted-foreground"}>Sign up</span>
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-[#ffe6da] px-3 py-2 text-sm text-[#d94714]" role="alert">
          {error}
        </p>
      )}

      {tab === "login" ? (
        <form action={login} className="flex flex-col">
          <input type="hidden" name="redirect" value={redirectTo} />
          <div className="mb-4">
            <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-[#2b3138]">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              defaultValue={defaultEmail}
              className="h-11 w-full rounded-xl border border-[#e6ebf3] bg-[#f6f9ff] px-3 text-sm text-[#5e6d84] outline-none ring-0 placeholder:text-[#9aa6bc] focus:border-primary"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-[#2b3138]">
              Password
            </label>
            <div className="flex h-11 items-center rounded-xl border border-[#e6ebf3] bg-[#f6f9ff] px-3 focus-within:border-primary">
              <input
                id="login-password"
                type={showLoginPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-full w-full border-0 bg-transparent text-sm text-[#5e6d84] outline-none placeholder:text-[#9aa6bc]"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((v) => !v)}
                className="ml-3 text-sm font-semibold text-primary"
                aria-label={showLoginPassword ? "Hide password" : "Show password"}
              >
                {showLoginPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <LoginSubmitButton />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Forgot your password?{" "}
            <a href="#" className="font-semibold text-[#d94714]">
              Reset it
            </a>
          </p>
        </form>
      ) : (
        <form action={signup} className="flex flex-col">
          <input type="hidden" name="redirect" value={redirectTo} />

          <div className="mb-4">
            <label htmlFor="signup-full-name" className="mb-2 block text-sm font-semibold text-[#3b4e70]">
              Full name <span className="text-[#f04f45]">*</span>
            </label>
            <input
              id="signup-full-name"
              type="text"
              name="fullName"
              required
              autoComplete="name"
              placeholder="Alex Morgan"
              defaultValue={defaultFullName}
              className="h-11 w-full rounded-xl border border-[#e2e8f3] bg-[#f4f8ff] px-3 text-base text-[#51627e] outline-none placeholder:text-[#8b96aa] focus:border-primary"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-[#3b4e70]">
              Email address <span className="text-[#f04f45]">*</span>
            </label>
            <input
              id="signup-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              defaultValue={defaultEmail}
              className="h-11 w-full rounded-xl border border-[#e2e8f3] bg-[#f4f8ff] px-3 text-base text-[#51627e] outline-none placeholder:text-[#8b96aa] focus:border-primary"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-[#3b4e70]">
              Password <span className="text-[#f04f45]">*</span>
            </label>
            <div className="flex h-11 items-center rounded-xl border border-[#e2e8f3] bg-[#f4f8ff] px-3 focus-within:border-primary">
              <input
                id="signup-password"
                type={showSignupPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-full w-full border-0 bg-transparent text-base text-[#51627e] outline-none placeholder:text-[#8b96aa]"
              />
              <button
                type="button"
                onClick={() => setShowSignupPassword((v) => !v)}
                className="ml-3 text-sm font-semibold text-[#ff5a1f]"
                aria-label={showSignupPassword ? "Hide password" : "Show password"}
              >
                {showSignupPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e8edf5]">
              <div
                className="h-full bg-[#8ea5c8] transition-all"
                style={{ width: `${passwordStrengthPercent}%` }}
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-sm text-[#61708a]">Use at least 8 characters. Uppercase, lowercase, numbers, and symbols make it stronger.</p>
            <p className="mt-1 text-sm text-[#7f8da5]">Strength: {passwordStrength.label}</p>
          </div>

          <div className="mb-4">
            <label htmlFor="signup-confirm-password" className="mb-2 block text-sm font-semibold text-[#3b4e70]">
              Confirm password <span className="text-[#f04f45]">*</span>
            </label>
            <div
              className="flex h-11 items-center rounded-xl border bg-[#f4f8ff] px-3 focus-within:border-primary"
              style={{ borderColor: passwordsMatch ? "#e2e8f3" : "#d94714" }}
            >
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-full w-full border-0 bg-transparent text-base text-[#51627e] outline-none placeholder:text-[#8b96aa]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="ml-3 text-sm font-semibold text-[#ff5a1f]"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {!passwordsMatch && (
              <p className="mt-1.5 text-xs text-[#d94714]" role="alert">
                Passwords don&apos;t match.
              </p>
            )}
          </div>

          <SignupSubmitButton disabled={!canSubmitSignup} />
          <p className="mt-4 text-center text-sm text-[#61708a]">
            By signing up you agree to our <a href="#" className="font-medium text-[#44658f]">terms</a> and <a href="#" className="font-medium text-[#44658f]">privacy policy</a>
          </p>
        </form>
      )}
    </div>
  );
}
