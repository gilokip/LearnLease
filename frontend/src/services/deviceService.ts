import { api } from "@lib/axios";
import type {
  Device,
  CreateDevicePayload,
  UpdateDevicePayload,
  InventorySummary,
  ApiResponse,
  FilterState,
} from "@types/index";

export const deviceService = {
  getAll: (filters?: FilterState) =>
    api.get<ApiResponse<Device[]>>("/devices", { params: filters })
       .then((r) => r.data.data),

  getById: (id: number) =>
    api.get<ApiResponse<Device>>(`/devices/${id}`)
       .then((r) => r.data.data),

  getSummary: () =>
    api.get<ApiResponse<InventorySummary>>("/devices/summary")
       .then((r) => r.data.data),

  create: (payload: CreateDevicePayload) =>
    api.post<ApiResponse<Device>>("/devices", payload)
       .then((r) => r.data.data),

  update: (id: number, payload: UpdateDevicePayload) =>
    api.put<ApiResponse<Device>>(`/devices/${id}`, payload)
       .then((r) => r.data.data),

  sendToMaintenance: (id: number, issue: string) =>
    api.post<ApiResponse<{ maintenanceLogId: number }>>(`/devices/${id}/maintenance`, { issue })
       .then((r) => r.data.data),
};
