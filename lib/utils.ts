import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number | string) {
  const n = typeof value === "string" ? Number.parseFloat(value) : value
  return `$${n.toFixed(0)}`
}


export function formatDate(date: string) {
  const d = new Date(date + "T00:00:00")
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function formatLongDate(date: string) {
  const d = new Date(date + "T00:00:00")
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
