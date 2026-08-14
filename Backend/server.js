require("dotenv").config();
const app = require("./src/app");
const { sequelize } = require("./src/models");

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await sequelize.authenticate();
        console.log("✅ Kết nối MySQL thành công");

        // In development, sync models to DB (create tables if not exist).
        // Use { alter: true } while iterating on the schema; switch to
        // migrations for production once the schema stabilizes.
        await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
        console.log("✅ Đồng bộ models thành công");

        app.listen(PORT, () => {
            console.log(`🚀 SH MART API đang chạy tại http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Không thể khởi động server:", err);
        process.exit(1);
    }
}

start();