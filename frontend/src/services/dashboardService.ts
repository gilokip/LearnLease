import { api } from "@lib/axios";
import type { AdminStats, StudentStats, ApiResponse } from "@types/index";

export interface ActivityEvent {
  type:     "lease" | "payment" | "maintenance" | "ticket";
  icon:     "approved" | "application" | "returned" | "payment" | "maintenance" | "ticket";
  label:    string;
  subtitle: string;
  ts:       string;
}

export const dashboardService = {
  getStats: (): Promise<AdminStats | StudentStats> =>
    api.get<ApiResponse<AdminStats | StudentStats>>("/dashboard/stats")
       .then((r) => r.data.data),

  getActivity: (): Promise<ActivityEvent[]> =>
    api.get<ApiResponse<ActivityEvent[]>>("/dashboard/activity")
       .then((r) => r.data.data),
};