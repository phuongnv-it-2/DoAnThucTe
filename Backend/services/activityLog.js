const { Op } = require("sequelize");
const { ActivityLog, User } = require("../models");

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

async function getAll({ userId, entity, action, fromDate, toDate, limit } = {}) {
    const where = {};
    if (userId) where.userId = userId;
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
        if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    return ActivityLog.findAll({
        where,
        include: [{ model: User, as: "user", attributes: ["id", "fullName", "username"] }],
        order: [["createdAt", "DESC"]],
        limit: limit ? Number(limit) : 100, // mặc định giới hạn 100 dòng gần nhất, tránh tải toàn bộ bảng
    });
}

module.exports = { logActivity, getAll };