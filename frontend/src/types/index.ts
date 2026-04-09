// ============================================================
// UniLease — Shared TypeScript Types
// ============================================================

// ── Enums ────────────────────────────────────────────────────

export type Role = "student" | "admin" | "inventory" | "finance";

export type LeaseStatus =
  | "pending"
  | "approved"
  | "active"
  | "returned"
  | "rejected"
  | "expired";

export type DeviceStatus =
  | "available"
  | "leased"
  | "maintenance"
  | "decommissioned";

export type PlanType = "semester" | "annual" | "monthly";

export type PaymentStatus = "pending" | "paid" | "overdue" | "waived";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type MaintenanceStatus = "reported" | "in_progress" | "resolved";

// ── Auth ─────────────────────────────────────────────────────

export interface AuthUser {
  id:        number;
  name:      string;
  email:     string;
  role:      Role;
  studentId: string | null;
}

export interface LoginCredentials {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  name:       string;
  email:      string;
  password:   string;
  role:       Role;
  studentId?: string;
}

export interface AuthResponse {
  token: string;
  user:  AuthUser;
}

// ── User ─────────────────────────────────────────────────────

export interface User {
  id:         number;
  name:       string;
  email:      string;
  role:       Role;
  student_id: string | null;
  is_active:  boolean;
  created_at: string;
}

// ── Device ───────────────────────────────────────────────────

export interface Device {
  id:               number;
  brand:            string;
  model:            string;
  serial_number:    string;
  specs:            string | null;
  monthly_rate:     number;
  campus_location:  string | null;
  status:           DeviceStatus;
  condition_notes:  string | null;
  purchased_date:   string | null;
  created_at:       string;
  updated_at:       string | null;
}

export interface CreateDevicePayload {
  brand:          string;
  model:          string;
  serialNumber:   string;
  specs?:         string;
  monthlyRate:    number;
  campusLocation?: string;
  purchasedDate?: string;
}

export interface UpdateDevicePayload {
  status?:          DeviceStatus;
  monthlyRate?:     number;
  campusLocation?:  string;
  conditionNotes?:  string;
}

// ── Lease ────────────────────────────────────────────────────

export interface Lease {
  id:              number;
  student_id:      number;
  device_id:       number;
  plan_type:       PlanType;
  duration_weeks:  number;
  status:          LeaseStatus;
  start_date:      string | null;
  end_date:        string | null;
  approved_by:     number | null;
  rejection_note:  string | null;
  created_at:      string;
  updated_at:      string | null;
  /* Joined fields */
  brand?:          string;
  model?:          string;
  serial_number?:  string;
  monthly_rate?:   number;
  student_name?:   string;
  student_email?:  string;
}

export interface CreateLeasePayload {
  deviceId:       number;
  planType:       PlanType;
  durationWeeks?: number;
}

export interface UpdateLeaseStatusPayload {
  status:          "approved" | "rejected" | "returned";
  rejectionNote?:  string;
}

// ── Payment ──────────────────────────────────────────────────

export interface Payment {
  id:           number;
  lease_id:     number;
  amount:       number;
  due_date:     string;
  paid_date:    string | null;
  status:       PaymentStatus;
  payment_ref:  string | null;
  notes:        string | null;
  created_at:   string;
  /* Joined fields */
  student_name?: string;
  email?:        string;
  brand?:        string;
  model?:        string;
  plan_type?:    PlanType;
}

export interface PaymentSummary {
  monthly:  number;
  annual:   number;
  pending:  { count: number; amount: number };
  overdue:  { count: number; amount: number };
}

// ── Support Ticket ───────────────────────────────────────────

export interface SupportTicket {
  id:            number;
  user_id:       number;
  lease_id:      number | null;
  subject:       string;
  description:   string | null;
  priority:      TicketPriority;
  status:        TicketStatus;
  assigned_to:   number | null;
  resolved_at:   string | null;
  created_at:    string;
  updated_at:    string | null;
  /* Joined fields */
  user_name?:     string;
  email?:         string;
  assigned_name?: string;
}

export interface CreateTicketPayload {
  subject:      string;
  description?: string;
  priority?:    TicketPriority;
  leaseId?:     number;
}

// ── Maintenance ──────────────────────────────────────────────

export interface MaintenanceLog {
  id:               number;
  device_id:        number;
  reported_by:      number;
  issue:            string;
  resolution:       string | null;
  status:           MaintenanceStatus;
  cost:             number | null;
  created_at:       string;
  resolved_at:      string | null;
  /* Joined fields */
  brand?:            string;
  model?:            string;
  serial_number?:    string;
  reported_by_name?: string;
}

// ── Dashboard Stats ──────────────────────────────────────────

export interface InventorySummary {
  total:          number;
  available:      number;
  leased:         number;
  maintenance:    number;
  decommissioned: number;
}

export interface AdminStats {
  devices:  InventorySummary;
  leases:   Record<LeaseStatus | "total", number>;
  users:    Record<Role | "total", number>;
  payments: PaymentSummary;
  tickets:  Record<TicketStatus, number>;
}

export interface StudentStats {
  activeLease:   Lease | null;
  pendingLease:  Lease | null;
  nextPayment:   Payment | null;
  overdueCount:  number;
  overdueAmount: number;
  leaseHistory:  Lease[];
}

// ── API Response wrapper ─────────────────────────────────────

export interface ApiResponse<T> {
  status:  "success" | "error";
  message: string;
  data:    T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

// ── Misc ─────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string | number;
}

export type SortDirection = "asc" | "desc";

export interface TableSort {
  column:    string;
  direction: SortDirection;
}

export interface FilterState {
  search?:   string;
  status?:   string;
  role?:     string;
  page?:     number;
  limit?:    number;
}
