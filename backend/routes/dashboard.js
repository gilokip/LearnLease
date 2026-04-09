const express           = require("express");
const DashboardService  = require("../services/DashboardService");
const { authenticate, requireRole } = require("../middleware/auth");
const { sendSuccess } = require("../utils/response");

const router = express.Router();
router.use(authenticate);

// GET /api/dashboard/stats — role-aware overview
router.get("/stats", async (req, res, next) => {
  try {
    let data;
    switch (req.user.role) {
      case "admin":
        data = await DashboardService.getAdminStats();
        break;
      case "student":
        data = await DashboardService.getStudentStats(req.user.id);
        break;
      case "inventory":
        data = await DashboardService.getInventoryStats();
        break;
      case "finance":
        data = await DashboardService.getFinanceStats();
        break;
      default:
        data = {};
    }
    sendSuccess(res, data);
  } catch (err) { next(err); }
});

// GET /api/dashboard/activity — recent activity feed, role-aware
router.get("/activity", async (req, res, next) => {
  try {
    let activity;
    if (req.user.role === "student") {
      activity = await DashboardService.getStudentRecentActivity(req.user.id);
    } else {
      activity = await DashboardService.getRecentActivity();
    }
    sendSuccess(res, activity);
  } catch (err) { next(err); }
});

module.exports = router;