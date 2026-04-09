import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { deviceService } from "@services/deviceService";
import { queryKeys }     from "@lib/queryKeys";
import type { CreateDevicePayload, UpdateDevicePayload, FilterState } from "@types/index";

export function useDevices(filters?: FilterState) {
  return useQuery({
    queryKey: queryKeys.devices(filters),
    queryFn:  () => deviceService.getAll(filters),
  });
}

export function useDevice(id: number) {
  return useQuery({
    queryKey: queryKeys.device(id),
    queryFn:  () => deviceService.getById(id),
    enabled:  !!id,
  });
}

export function useDeviceSummary() {
  return useQuery({
    queryKey: queryKeys.deviceSummary(),
    queryFn:  deviceService.getSummary,
  });
}

export function useCreateDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDevicePayload) => deviceService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.devices() });
      qc.invalidateQueries({ queryKey: queryKeys.deviceSummary() });
      toast.success("Device added successfully.");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to add device."),
  });
}

export function useUpdateDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDevicePayload }) =>
      deviceService.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.device(id) });
      qc.invalidateQueries({ queryKey: queryKeys.devices() });
      toast.success("Device updated.");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Update failed."),
  });
}

export function useSendToMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, issue }: { id: number; issue: string }) =>
      deviceService.sendToMaintenance(id, issue),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.devices() });
      qc.invalidateQueries({ queryKey: queryKeys.maintenance() });
      toast.success("Device sent to maintenance.");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Action failed."),
  });
}
