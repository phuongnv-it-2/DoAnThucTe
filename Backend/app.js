const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

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

// Additional route modules (products, categories, inventory, invoices,
// print orders, shifts, reports, activity-logs) will be mounted here
// in the following phases.

/* --------------------------------- 404 / errors ---------------------------- */
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;