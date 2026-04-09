import { api } from "@lib/axios";
import type { AdminStats, StudentStats, ApiResponse } from "@types/index";

export const dashboardService = {
  getStats: () =>
    api.get<ApiResponse<AdminStats | StudentStats>>("/dashboard/stats")
       .then((r) => r.data.data),
};
