require("dotenv").config();

module.exports = {
  port:         process.env.PORT        || 3001,
  clientUrl:    process.env.CLIENT_URL  || "http://localhost:5173",
  jwtSecret:    process.env.JWT_SECRET  || "unilease_secret_change_in_prod",
  jwtExpiresIn: process.env.JWT_EXPIRES || "7d",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  nodeEnv:      process.env.NODE_ENV    || "development",

  validRoles: ["student", "admin", "inventory", "finance"],

  leaseStatus: {
    PENDING:  "pending",
    APPROVED: "approved",
    ACTIVE:   "active",
    RETURNED: "returned",
    REJECTED: "rejected",
    EXPIRED:  "expired",
  },

  deviceStatus: {
    AVAILABLE:      "available",
    LEASED:         "leased",
    MAINTENANCE:    "maintenance",
    DECOMMISSIONED: "decommissioned",
  },

  paymentStatus: {
    PENDING: "pending",
    PAID:    "paid",
    OVERDUE: "overdue",
    WAIVED:  "waived",
  },

  ticketStatus: {
    OPEN:        "open",
    IN_PROGRESS: "in_progress",
    RESOLVED:    "resolved",
    CLOSED:      "closed",
  },
};
