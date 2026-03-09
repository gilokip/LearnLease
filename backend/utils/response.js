/**
 * Standard success response wrapper.
 */
const sendSuccess = (res, data, { message = "Success", statusCode = 200 } = {}) => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

/**
 * Standard paginated response wrapper.
 */
const sendPaginated = (res, { data, total, page, limit }) => {
  res.status(200).json({
    status: "success",
    data,
    pagination: {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
};

/**
 * Parse common pagination query params.
 */
const parsePagination = (query) => {
  const page  = Math.max(1, parseInt(query.page  || 1,  10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || 20, 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

module.exports = { sendSuccess, sendPaginated, parsePagination };
