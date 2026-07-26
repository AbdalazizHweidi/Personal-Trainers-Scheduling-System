export function getSafeRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value) return fallback;

  const trimmedValue = value.trim();
  if (!trimmedValue.startsWith("/")) return fallback;

  const lowerValue = trimmedValue.toLowerCase();
  if (
    trimmedValue.startsWith("//") ||
    lowerValue.startsWith("/javascript:") ||
    lowerValue.startsWith("/data:")
  ) {
    return fallback;
  }

  try {
    const url = new URL(trimmedValue, "http://localhost");

    if (url.origin !== "http://localhost") return fallback;

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}