import { api } from "@lib/axios";
import type {
  SupportTicket,
  CreateTicketPayload,
  ApiResponse,
  FilterState,
  TicketStatus,
} from "@types/index";

export const ticketService = {
  getAll: (filters?: FilterState) =>
    api.get<ApiResponse<SupportTicket[]>>("/tickets", { params: filters })
       .then((r) => r.data.data),

  getById: (id: number) =>
    api.get<ApiResponse<SupportTicket>>(`/tickets/${id}`)
       .then((r) => r.data.data),

  create: (payload: CreateTicketPayload) =>
    api.post<ApiResponse<SupportTicket>>("/tickets", payload)
       .then((r) => r.data.data),

  update: (id: number, payload: { status?: TicketStatus; assignedTo?: number; resolution?: string }) =>
    api.put<ApiResponse<SupportTicket>>(`/tickets/${id}`, payload)
       .then((r) => r.data.data),
};
