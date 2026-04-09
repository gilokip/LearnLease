import { api } from "@lib/axios";
import type { Payment, PaymentSummary, ApiResponse, FilterState } from "@types/index";

export const paymentService = {
  getAll: (filters?: FilterState) =>
    api.get<ApiResponse<Payment[]>>("/payments", { params: filters })
       .then((r) => r.data.data),

  getSummary: () =>
    api.get<ApiResponse<PaymentSummary>>("/payments/summary")
       .then((r) => r.data.data),

  markPaid: (id: number, paidDate?: string, paymentRef?: string) =>
    api.post<ApiResponse<null>>(`/payments/${id}/pay`, { paidDate, paymentRef })
       .then((r) => r.data),

  sweepOverdue: () =>
    api.post<ApiResponse<{ updatedCount: number }>>("/payments/sweep-overdue")
       .then((r) => r.data.data),
};
