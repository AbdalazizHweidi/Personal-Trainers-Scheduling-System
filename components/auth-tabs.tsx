"use client";

import { useState } from "react";
import { login, signup } from "@/app/login/actions";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #d7dad2",
  borderRadius: 4,
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  background: "#fff",
  color: "#171b1f",
};

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

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;
  const canSubmitSignup = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div>
      <div className="mb-7 flex" style={{ borderBottom: "1px solid #d7dad2" }}>
        <button
          onClick={() => setTab("login")}
          className="mr-6 pb-2.5 pt-2.5 text-sm font-semibold"
          style={{
            borderBottom: `2px solid ${tab === "login" ? "#ff5a1f" : "transparent"}`,
            color: tab === "login" ? "#171b1f" : "#5b6670",
          }}
        >
          Log in
        </button>
        <button
          onClick={() => setTab("signup")}
          className="pb-2.5 pt-2.5 text-sm font-semibold"
          style={{
            borderBottom: `2px solid ${tab === "signup" ? "#ff5a1f" : "transparent"}`,
            color: tab === "signup" ? "#171b1f" : "#5b6670",
          }}
        >
          Sign up
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded px-3 py-2 text-sm" style={{ background: "#ffe6da", color: "#d94714" }}>
          {error}
        </p>
      )}

      {tab === "login" ? (
        <form action={login} className="flex flex-col">
          <input type="hidden" name="redirect" value={redirectTo} />
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#2b3138" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="alex@email.com"
              defaultValue={tab === "login" ? defaultEmail : undefined}
              style={inputStyle}
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#2b3138" }}>
              Password
            </label>
            <input type="password" name="password" required placeholder="••••••••" style={inputStyle} />
          </div>
          <button
            type="submit"
            className="w-full rounded-[3px] py-2.5 text-sm font-semibold text-white"
            style={{ background: "#ff5a1f" }}
          >
            Log in
          </button>
          <p className="mt-4 text-center text-xs" style={{ color: "#5b6670" }}>
            Forgot your password?{" "}
            <a href="#" className="font-semibold" style={{ color: "#d94714" }}>
              Reset it
            </a>
          </p>
        </form>
      ) : (
        <form action={signup} className="flex flex-col">
          <input type="hidden" name="redirect" value={redirectTo} />
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#2b3138" }}>
              Full name
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="Alex Morgan"
              defaultValue={defaultFullName}
              style={inputStyle}
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#2b3138" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="alex@email.com"
              defaultValue={defaultEmail}
              style={inputStyle}
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#2b3138" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#2b3138" }}>
              Confirm password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: passwordsMatch ? "#d7dad2" : "#d94714",
              }}
            />
            {!passwordsMatch && (
              <p className="mt-1.5 text-xs" style={{ color: "#d94714" }}>
                Passwords don&apos;t match.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={!canSubmitSignup}
            className="w-full rounded-[3px] py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "#ff5a1f" }}
          >
            Create account
          </button>
          <p className="mt-4 text-center text-xs" style={{ color: "#5b6670" }}>
            By signing up you agree to our terms and privacy policy.
          </p>
        </form>
      )}
    </div>
  );
}