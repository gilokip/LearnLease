import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@services/dashboardService";
import { queryKeys }        from "@lib/queryKeys";

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn:  dashboardService.getStats,
    refetchInterval: 60_000, // refresh every minute
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: [...queryKeys.dashboardStats(), "activity"],
    queryFn:  dashboardService.getActivity,
    refetchInterval: 60_000,
  });
}