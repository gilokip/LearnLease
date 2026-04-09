import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { authService }  from "@services/authService";
import { useAuthStore } from "@store/authStore";
import { queryKeys }    from "@lib/queryKeys";
import type { LoginCredentials, RegisterPayload } from "@types/index";

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      navigate("/dashboard", { replace: true });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Login failed.");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: () => {
      toast.success("Account created! Please sign in.");
      navigate("/login");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Registration failed.");
    },
  });

  const logout = () => {
    clearAuth();
    queryClient.clear();
    toast.success("Signed out successfully.");
    navigate("/login", { replace: true });
  };

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => toast.success("Password changed successfully."),
    onError:   (err: any) => toast.error(err?.response?.data?.message ?? "Could not change password."),
  });

  return {
    user,
    token,
    isAuthenticated,
    login:          loginMutation.mutate,
    loginAsync:     loginMutation.mutateAsync,
    isLoggingIn:    loginMutation.isPending,
    register:       registerMutation.mutate,
    registerAsync:  registerMutation.mutateAsync,
    isRegistering:  registerMutation.isPending,
    logout,
    changePassword: changePasswordMutation.mutate,
  };
}
