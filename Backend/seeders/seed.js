require("dotenv").config();
const { sequelize, Role, User, Employee } = require("../models");

const DEFAULT_ROLES = [
    { name: "ADMIN", description: "Quản trị viên hệ thống - toàn quyền" },
    { name: "MANAGER", description: "Quản lý ca làm việc, nhân viên, báo cáo" },
    { name: "STAFF", description: "Nhân viên bán hàng / thu ngân" },
];

async function seedRoles() {
    for (const roleData of DEFAULT_ROLES) {
        const [role, wasCreated] = await Role.findOrCreate({
            where: { name: roleData.name },
            defaults: roleData,
        });
        console.log(
            wasCreated
                ? `✅ Đã tạo role: ${role.name}`
                : `↪️  Role đã tồn tại: ${role.name}`
        );
    }
}

async function seedAdmin() {
    const username = process.env.SEED_ADMIN_USERNAME || "admin";
    const password = process.env.SEED_ADMIN_PASSWORD || "Admin@123";
    const email = process.env.SEED_ADMIN_EMAIL || "admin@shmart.local";
    const fullName = process.env.SEED_ADMIN_FULLNAME || "Quản trị viên";

    const existing = await User.findOne({ where: { username } });
    if (existing) {
        console.log(`↪️  Tài khoản admin "${username}" đã tồn tại, bỏ qua.`);
        return existing;
    }

    const adminRole = await Role.findOne({ where: { name: "ADMIN" } });
    if (!adminRole) {
        throw new Error("Không tìm thấy role ADMIN. Hãy chạy seedRoles() trước.");
    }

    // Mật khẩu sẽ tự động được hash bởi hook beforeCreate trong model User
    const admin = await User.create({
        username,
        email,
        password,
        fullName,
        roleId: adminRole.id,
    });

    const employeeCode = `NV${String(admin.id).padStart(4, "0")}`;
    await Employee.create({
        userId: admin.id,
        employeeCode,
        hireDate: new Date(),
    });

    console.log(`✅ Đã tạo tài khoản admin: ${username} / ${password}`);
    console.log("⚠️  Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu.");
    return admin;
}

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("✅ Kết nối MySQL thành công");

        // Không dùng { alter: true } ở đây — chỉ đảm bảo bảng tồn tại.
        // Việc sync/alter schema đã được xử lý trong server.js khi start dev.
        await sequelize.sync();

        await seedRoles();
        await seedAdmin();

        console.log("🎉 Seed dữ liệu hoàn tất.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Lỗi khi seed dữ liệu:", err);
        process.exit(1);
    }
}

seed();