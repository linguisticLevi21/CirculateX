/**
 * utils/response.js
 *
 * WHY THIS EXISTS:
 * Every API response should have the same shape so the frontend can
 * predictably handle success and error cases:
 *
 *   Success: { success: true,  data: {...},    message: "..." }
 *   Error:   { success: false, error: "CODE",  message: "..." }
 *
 * Without these helpers, each controller would manually construct the
 * response object, leading to inconsistency (some use "data", some use "result",
 * some forget to set "success", etc.).
 *
 * INTERVIEW ANSWER:
 * "A consistent response envelope means the frontend can always check
 * response.success and either read response.data or display response.message.
 * This prevents an entire class of frontend bugs where you try to access
 * a field that doesn't exist on an error response."
 */

/**
 * Send a successful JSON response.
 * @param {object} res  - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {any}    data      - The payload to send
 * @param {string} message   - Optional human-readable message
 */
const sendSuccess = (res, statusCode = 200, data = null, message = '') => {
  const body = { success: true };
  if (data !== null) body.data = data;
  if (message) body.message = message;
  return res.status(statusCode).json(body);
};

/**
 * Send an error JSON response.
 * @param {object} res      - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message  - Human-readable error message
 * @param {string} error    - Machine-readable short error code
 */
const sendError = (res, statusCode = 500, message = 'Something went wrong', error = 'INTERNAL_ERROR') => {
  return res.status(statusCode).json({ success: false, error, message });
};

module.exports = { sendSuccess, sendError };
