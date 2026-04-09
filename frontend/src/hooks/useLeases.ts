import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { leaseService } from "@services/leaseService";
import { queryKeys }    from "@lib/queryKeys";
import type { CreateLeasePayload, UpdateLeaseStatusPayload, FilterState } from "@types/index";

export function useLeases(filters?: FilterState) {
  return useQuery({
    queryKey: queryKeys.leases(filters),
    queryFn:  () => leaseService.getAll(filters),
  });
}

export function useLease(id: number) {
  return useQuery({
    queryKey: queryKeys.lease(id),
    queryFn:  () => leaseService.getById(id),
    enabled:  !!id,
  });
}

export function useExpiringLeases(days = 7) {
  return useQuery({
    queryKey: queryKeys.expiring(days),
    queryFn:  () => leaseService.getExpiring(days),
  });
}

export function useApplyForLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeasePayload) => leaseService.apply(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leases() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats() });
      toast.success("Lease application submitted! Await admin approval.");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Application failed."),
  });
}

export function useUpdateLeaseStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateLeaseStatusPayload }) =>
      leaseService.updateStatus(id, payload),
    onSuccess: (_data, { payload }) => {
      qc.invalidateQueries({ queryKey: queryKeys.leases() });
      qc.invalidateQueries({ queryKey: queryKeys.devices() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats() });
      toast.success(`Lease ${payload.status} successfully.`);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Status update failed."),
  });
}
