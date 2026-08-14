const { ActivityLog } = require("../models");

/**
 * Central helper to record an activity log entry.
 * Never throws - logging failures must not break the main flow.
 *
 * @param {Object} params
 * @param {number|null} params.userId
 * @param {"CREATE"|"UPDATE"|"DELETE"|"LOGIN"|"LOGOUT"|"OTHER"} params.action
 * @param {string} params.entity - e.g. "Product", "Invoice"
 * @param {number|null} params.entityId
 * @param {string} params.description - human readable message (Vietnamese)
 * @param {string|null} params.ipAddress
 */
async function logActivity({
    userId = null,
    action,
    entity,
    entityId = null,
    description,
    ipAddress = null,
}) {
    try {
        await ActivityLog.create({
            userId,
            action,
            entity,
            entityId,
            description,
            ipAddress,
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[ActivityLog] Failed to write log:", err.message);
    }
}

module.exports = { logActivity };