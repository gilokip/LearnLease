const { AppError } = require("../utils/errors");

/**
 * Validates req.body against a schema object.
 * Schema format:  { fieldName: { required, type, enum, minLength, maxLength, min, max } }
 *
 * Usage:
 *   router.post("/", validate(schemas.createDevice), DeviceController.create);
 */
const validate = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`'${field}' is required.`);
      continue;
    }

    if (value === undefined || value === null) continue; // optional & absent → skip

    if (rules.type === "string"  && typeof value !== "string") errors.push(`'${field}' must be a string.`);
    if (rules.type === "number"  && isNaN(Number(value)))      errors.push(`'${field}' must be a number.`);
    if (rules.type === "boolean" && typeof value !== "boolean") errors.push(`'${field}' must be a boolean.`);
    if (rules.type === "email"   && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push(`'${field}' must be a valid email.`);

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`'${field}' must be one of: ${rules.enum.join(", ")}.`);
    }

    if (rules.minLength && String(value).length < rules.minLength) {
      errors.push(`'${field}' must be at least ${rules.minLength} characters.`);
    }
    if (rules.maxLength && String(value).length > rules.maxLength) {
      errors.push(`'${field}' must not exceed ${rules.maxLength} characters.`);
    }
    if (rules.min !== undefined && Number(value) < rules.min) {
      errors.push(`'${field}' must be at least ${rules.min}.`);
    }
    if (rules.max !== undefined && Number(value) > rules.max) {
      errors.push(`'${field}' must not exceed ${rules.max}.`);
    }
  }

  if (errors.length) {
    return next(new AppError(errors.join(" "), 422));
  }

  next();
};

// ======================== VALIDATION SCHEMAS ========================
const schemas = {
  register: {
    name:     { required: true,  type: "string",  minLength: 2, maxLength: 255 },
    email:    { required: true,  type: "email" },
    password: { required: true,  type: "string",  minLength: 8 },
    role:     { required: true,  type: "string",  enum: ["student", "admin", "inventory", "finance"] },
  },

  login: {
    email:    { required: true, type: "email" },
    password: { required: true, type: "string" },
  },

  createDevice: {
    brand:        { required: true,  type: "string", maxLength: 100 },
    model:        { required: true,  type: "string", maxLength: 200 },
    serialNumber: { required: true,  type: "string", maxLength: 100 },
    monthlyRate:  { required: true,  type: "number", min: 0 },
  },

  createLease: {
    deviceId:      { required: true,  type: "number", min: 1 },
    planType:      { required: true,  type: "string", enum: ["semester", "annual", "monthly"] },
    durationWeeks: { required: false, type: "number", min: 1, max: 52 },
  },

  updateLeaseStatus: {
    status: { required: true, type: "string", enum: ["approved", "rejected", "returned"] },
  },

  createTicket: {
    subject:     { required: true,  type: "string", minLength: 5, maxLength: 255 },
    description: { required: false, type: "string" },
    priority:    { required: false, type: "string", enum: ["low", "medium", "high", "urgent"] },
  },

  recordPayment: {
    leaseId: { required: true, type: "number", min: 1 },
    amount:  { required: true, type: "number", min: 0 },
  },
};

module.exports = { validate, schemas };
