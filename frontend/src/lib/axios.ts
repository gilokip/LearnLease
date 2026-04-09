import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Helper: read token from zustand's persisted JSON blob ────
function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem("unilease_user");
    if (!raw) return null;
    // zustand persist wraps state under { state: { ... }, version: N }
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    // If the blob is corrupted/unparseable, wipe it so the app doesn't
    // get stuck in a broken-rehydration loop (this was the root cause
    // of the "Unexpected token" error)
    localStorage.removeItem("unilease_user");
    return null;
  }
}

// ── Request interceptor: attach JWT ──────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle errors globally ─────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message ?? "Something went wrong.";

    if (status === 401) {
      // ✅ Only remove the single zustand key — no more stale unilease_token key
      localStorage.removeItem("unilease_user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error("You do not have permission to perform this action.");
    } else if (status === 422) {
      toast.error(message);
    } else if (status && status >= 500) {
      toast.error("A server error occurred. Please try again later.");
    }

    return Promise.reject(error);
  }
);