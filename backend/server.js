require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const rateLimit = require("express-rate-limit");

const { port, clientUrl, nodeEnv } = require("./config/constants");
const { requestLogger }  = require("./middleware/logger");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Route modules
const authRoutes        = require("./routes/auth");
const userRoutes        = require("./routes/users");
const deviceRoutes      = require("./routes/devices");
const leaseRoutes       = require("./routes/leases");
const paymentRoutes     = require("./routes/payments");
const ticketRoutes      = require("./routes/tickets");
const maintenanceRoutes = require("./routes/maintenance");
const dashboardRoutes   = require("./routes/dashboard");
const auditLogRoutes    = require("./routes/auditLogs");

const app = express();

// ======================== GLOBAL MIDDLEWARE ========================

app.use(helmet());

app.use(cors({
  origin:      clientUrl,
  credentials: true,
  methods:     ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// General rate limiter (100 req / 15 min per IP)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { status: "error", message: "Too many requests. Please try again later." },
}));

// Stricter limiter for auth endpoints (10 req / 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message: { status: "error", message: "Too many authentication attempts." },
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ======================== HEALTH CHECK ========================

app.get("/health", (req, res) => {
  res.json({
    status:      "ok",
    environment: nodeEnv,
    timestamp:   new Date().toISOString(),
    version:     process.env.npm_package_version || "1.0.0",
  });
});

// ======================== API ROUTES ========================

app.use("/api/auth",        authLimiter, authRoutes);
app.use("/api/users",       userRoutes);
app.use("/api/devices",     deviceRoutes);
app.use("/api/leases",      leaseRoutes);
app.use("/api/payments",    paymentRoutes);
app.use("/api/tickets",     ticketRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/dashboard",   dashboardRoutes);
app.use("/api/audit-logs",  auditLogRoutes);

// ======================== ERROR HANDLING ========================

app.use(notFound);
app.use(errorHandler);

// ======================== START ========================

app.listen(port, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║          UniLease API Server                 ║
╠══════════════════════════════════════════════╣
║  Environment : ${nodeEnv.padEnd(28)}║
║  Port        : ${String(port).padEnd(28)}║
║  Client URL  : ${clientUrl.padEnd(28)}║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app; // for testing
