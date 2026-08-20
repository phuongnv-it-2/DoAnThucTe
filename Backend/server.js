require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await sequelize.authenticate();
        console.log("✅ Kết nối MySQL thành công");

        await sequelize.sync();
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