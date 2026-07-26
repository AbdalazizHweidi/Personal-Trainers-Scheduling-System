"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BookCta({
  isLoggedIn,
  href,
  className,
  children,
}: {
  isLoggedIn: boolean;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showMessage, setShowMessage] = useState(false);

  function handleClick(e: React.MouseEvent) {
    if (isLoggedIn) return; // let the normal link navigation happen
    e.preventDefault();
    setShowMessage(true);
    setTimeout(() => {
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
    }, 1200);
  }

  return (
    <span className="relative inline-block">
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>
      {showMessage && (
        <span className="absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 rounded-md border border-border bg-card px-3 py-2 text-xs text-card-foreground shadow-md">
          Please log in to book a session — redirecting…
        </span>
      )}
    </span>
  );
}