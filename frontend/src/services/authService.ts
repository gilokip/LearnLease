import { api } from "@lib/axios";
import type {
  LoginCredentials,
  RegisterPayload,
  AuthResponse,
  ApiResponse,
  AuthUser,
} from "@types/index";

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", credentials)
       .then((r) => r.data.data),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<{ user: AuthUser }>>("/auth/register", payload)
       .then((r) => r.data.data),

  getMe: () =>
    api.get<ApiResponse<AuthUser>>("/auth/me")
       .then((r) => r.data.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse<null>>("/auth/change-password", { currentPassword, newPassword })
       .then((r) => r.data),
};
