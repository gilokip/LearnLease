import { api } from "@lib/axios";
import type {
  Lease,
  CreateLeasePayload,
  UpdateLeaseStatusPayload,
  ApiResponse,
  FilterState,
} from "@types/index";

export const leaseService = {
  getAll: (filters?: FilterState) =>
    api.get<ApiResponse<Lease[]>>("/leases", { params: filters })
       .then((r) => r.data.data),

  getById: (id: number) =>
    api.get<ApiResponse<Lease>>(`/leases/${id}`)
       .then((r) => r.data.data),

  getExpiring: (days = 7) =>
    api.get<ApiResponse<Lease[]>>("/leases/expiring", { params: { days } })
       .then((r) => r.data.data),

  apply: (payload: CreateLeasePayload) =>
    api.post<ApiResponse<Lease>>("/leases", payload)
       .then((r) => r.data.data),

  updateStatus: (id: number, payload: UpdateLeaseStatusPayload) =>
    api.put<ApiResponse<Lease>>(`/leases/${id}/status`, payload)
       .then((r) => r.data.data),
};
