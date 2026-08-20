const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const inventoryRoutes = require("./routes/inventory");
const invoiceRoutes = require("./routes/invoice");
const shiftRoutes = require("./routes/shift");
const printOrderRoutes = require("./routes/printOrder");
const activityLogRoutes = require("./routes/activityLog");
const reportRoutes = require("./routes/report");
const uploadRoutes = require("./routes/upload");
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const app = express();

/* ---------------------------- Global middleware -------------------------- */
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
}

/* --------------------------------- Health --------------------------------- */
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "SH MART API is running", time: new Date() });
});

/* --------------------------------- Routes --------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory-transactions", inventoryRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/print-orders", printOrderRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

/* --------------------------------- 404 / errors ---------------------------- */
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;