const express             = require("express");
const SupportTicketModel  = require("../models/SupportTicket");
const { authenticate, requireRole } = require("../middleware/auth");
const { validate, schemas }         = require("../middleware/validate");
const { sendSuccess, parsePagination } = require("../utils/response");
const { AppError } = require("../utils/errors");

const router = express.Router();
router.use(authenticate);

// GET /api/tickets — student: own; staff: all
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { status, priority, search } = req.query;

    let tickets;
    if (req.user.role === "student") {
      tickets = await SupportTicketModel.findByUser(req.user.id);
    } else {
      tickets = await SupportTicketModel.findAll({ status, priority, search, limit, offset });
    }
    sendSuccess(res, tickets);
  } catch (err) { next(err); }
});

// GET /api/tickets/:id
router.get("/:id", async (req, res, next) => {
  try {
    const ticket = await SupportTicketModel.findById(req.params.id);
    if (!ticket) throw new AppError("Ticket not found.", 404);
    if (req.user.role === "student" && ticket.user_id !== req.user.id)
      throw new AppError("Access denied.", 403);
    sendSuccess(res, ticket);
  } catch (err) { next(err); }
});

// POST /api/tickets — any authenticated user can open a ticket
router.post("/", validate(schemas.createTicket), async (req, res, next) => {
  try {
    const { subject, description, priority, leaseId } = req.body;
    const ticketId = await SupportTicketModel.create({
      userId: req.user.id,
      leaseId: leaseId || null,
      subject,
      description,
      priority,
    });
    const ticket = await SupportTicketModel.findById(ticketId);
    sendSuccess(res, ticket, { message: "Support ticket created.", statusCode: 201 });
  } catch (err) { next(err); }
});

// PUT /api/tickets/:id — admin/inventory can update status, assign, resolve
router.put("/:id", requireRole("admin", "inventory"), async (req, res, next) => {
  try {
    const { status, assignedTo, resolution } = req.body;
    await SupportTicketModel.update(req.params.id, { status, assignedTo, resolution });
    const ticket = await SupportTicketModel.findById(req.params.id);
    sendSuccess(res, ticket, { message: "Ticket updated." });
  } catch (err) { next(err); }
});

module.exports = router;
