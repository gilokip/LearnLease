import { format, formatDistanceToNow, parseISO } from "date-fns";

/** Format a number as USD currency. */
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

/** Format an ISO date string to a readable date. */
export const formatDate = (dateStr: string | null, pattern = "MMM d, yyyy"): string => {
  if (!dateStr) return "—";
  try { return format(parseISO(dateStr), pattern); }
  catch { return dateStr; }
};

/** Format a date as "X days ago" or "in X days". */
export const formatRelative = (dateStr: string | null): string => {
  if (!dateStr) return "—";
  try { return formatDistanceToNow(parseISO(dateStr), { addSuffix: true }); }
  catch { return dateStr; }
};

/** Capitalize first letter of a string. */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/** Convert snake_case to Title Case. */
export const snakeToTitle = (str: string): string =>
  str.split("_").map(capitalize).join(" ");

/** Truncate long text. */
export const truncate = (str: string, maxLength = 40): string =>
  str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
