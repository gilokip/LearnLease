import { api } from "@lib/axios";
import type { MaintenanceLog, ApiResponse, FilterState, MaintenanceStatus } from "@types/index";

export const maintenanceService = {
  getAll: (filters?: FilterState) =>
    api.get<ApiResponse<MaintenanceLog[]>>("/maintenance", { params: filters })
       .then((r) => r.data.data),

  getById: (id: number) =>
    api.get<ApiResponse<MaintenanceLog>>(`/maintenance/${id}`)
       .then((r) => r.data.data),

  resolve: (id: number, payload: { resolution?: string; cost?: number }) =>
    api.put<ApiResponse<MaintenanceLog>>(`/maintenance/${id}/resolve`, payload)
       .then((r) => r.data.data),

  updateStatus: (id: number, status: MaintenanceStatus) =>
    api.put<ApiResponse<null>>(`/maintenance/${id}/status`, { status })
       .then((r) => r.data),
};
