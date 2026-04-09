/**
 * Centralized React Query key factory.
 * All query keys live here — prevents typos and easy cache invalidation.
 */
export const queryKeys = {
  // Auth
  me: () => ["auth", "me"] as const,

  // Users
  users:     (filters?: object) => ["users", filters]            as const,
  user:      (id: number)       => ["users", id]                 as const,
  userStats: ()                 => ["users", "stats"]            as const,

  // Devices
  devices:       (filters?: object) => ["devices", filters]      as const,
  device:        (id: number)       => ["devices", id]           as const,
  deviceSummary: ()                 => ["devices", "summary"]    as const,

  // Leases
  leases:   (filters?: object)  => ["leases", filters]           as const,
  lease:    (id: number)        => ["leases", id]                as const,
  expiring: (days?: number)     => ["leases", "expiring", days]  as const,

  // Payments
  payments:        (filters?: object) => ["payments", filters]   as const,
  paymentSummary:  ()                 => ["payments", "summary"] as const,
  studentPayments: (studentId: number) => ["payments", "student", studentId] as const,

  // Support Tickets
  tickets:  (filters?: object) => ["tickets", filters]           as const,
  ticket:   (id: number)       => ["tickets", id]                as const,

  // Maintenance
  maintenance: (filters?: object) => ["maintenance", filters]    as const,
  maintenanceLog: (id: number)    => ["maintenance", id]         as const,

  // Dashboard
  dashboardStats: () => ["dashboard", "stats"] as const,

  // Audit Logs
  auditLogs: (filters?: object) => ["audit-logs", filters]       as const,
};
