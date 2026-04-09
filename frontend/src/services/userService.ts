import { api } from "@lib/axios";
import type { User, ApiResponse, FilterState } from "@types/index";

export const userService = {
  getAll: (filters?: FilterState) =>
    api.get<ApiResponse<User[]>>("/users", { params: filters })
       .then((r) => r.data.data),

  getById: (id: number) =>
    api.get<ApiResponse<User>>(`/users/${id}`)
       .then((r) => r.data.data),

  update: (id: number, payload: { name?: string; email?: string }) =>
    api.put<ApiResponse<User>>(`/users/${id}`, payload)
       .then((r) => r.data.data),

  deactivate: (id: number) =>
    api.delete<ApiResponse<null>>(`/users/${id}`)
       .then((r) => r.data),

  getStats: () =>
    api.get<ApiResponse<Record<string, number>>>("/users/stats")
       .then((r) => r.data.data),
};
