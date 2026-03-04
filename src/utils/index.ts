/**
 * Utility functions for the application
 */

/**
 * Constructs a proper storage URL from a path.
 * Handles various path formats:
 * - Full URLs (http/https) are returned as-is
 * - Paths already starting with /storage are returned as-is
 * - Other paths get /storage/ prepended
 *
 * @param path - The file path from the database
 * @returns The proper URL to access the file
 */
export function getStorageUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/storage")) return path;
  if (path.startsWith("/")) return path;
  return `/storage/${path}`;
}

/**
 * Format a date string to Indonesian locale
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateId(
  dateString: string | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
): string {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("id-ID", options);
  } catch {
    return dateString;
  }
}

/**
 * Format number to IDR currency string
 * @param amount - The number to format
 * @returns Formatted currency string (e.g. Rp 1.000.000)
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
