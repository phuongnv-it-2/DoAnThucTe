const reportService = require("../services/report");
const asyncHandler = require("../utils/asyncHandler");

const revenueSummary = asyncHandler(async (req, res) => {
    const { fromDate, toDate, groupBy } = req.query;
    const summary = await reportService.getRevenueSummary({ fromDate, toDate, groupBy });
    res.json({ success: true, data: summary });
});

const topProducts = asyncHandler(async (req, res) => {
    const { fromDate, toDate, limit } = req.query;
    const products = await reportService.getTopProducts({ fromDate, toDate, limit });
    res.json({ success: true, data: products });
});

const lowStock = asyncHandler(async (req, res) => {
    const products = await reportService.getLowStockProducts();
    res.json({ success: true, data: products });
});

module.exports = { revenueSummary, topProducts, lowStock };