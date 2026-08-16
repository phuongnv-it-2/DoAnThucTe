const activityLogService = require("../services/activityLog");
const asyncHandler = require("../utils/asyncHandler");

const getAll = asyncHandler(async (req, res) => {
    const { userId, entity, action, fromDate, toDate, limit } = req.query;
    const logs = await activityLogService.getAll({ userId, entity, action, fromDate, toDate, limit });
    res.json({ success: true, data: logs });
});

module.exports = { getAll };