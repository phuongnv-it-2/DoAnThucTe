const sequelize = require("../config/database");

const Role = require("./Role");
const User = require("./User");
const Employee = require("./Employee");
const Category = require("./Category");
const Product = require("./Product");
const InventoryTransaction = require("./InventoryTransaction");
const Shift = require("./Shift");
const ShiftAssignment = require("./ShiftAssignment");
const Invoice = require("./Invoice");
const InvoiceDetail = require("./InvoiceDetail");
const PrintOrder = require("./PrintOrder");
const PrintOrderDetail = require("./PrintOrderDetail");
const ActivityLog = require("./ActivityLog");
const BankTransaction = require("./BankTransaction");

/* ---------------------------------------------------------------- */
/* Role <-> User                                                     */
/* ---------------------------------------------------------------- */
Role.hasMany(User, { foreignKey: "roleId", as: "users" });
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

/* ---------------------------------------------------------------- */
/* User <-> Employee (1:1)                                           */
/* ---------------------------------------------------------------- */
User.hasOne(Employee, { foreignKey: "userId", as: "employee" });
Employee.belongsTo(User, { foreignKey: "userId", as: "user" });

/* ---------------------------------------------------------------- */
/* Category <-> Product                                              */
/* ---------------------------------------------------------------- */
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

/* ---------------------------------------------------------------- */
/* Product <-> InventoryTransaction                                  */
/* ---------------------------------------------------------------- */
Product.hasMany(InventoryTransaction, {
    foreignKey: "productId",
    as: "inventoryTransactions",
});
InventoryTransaction.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
});

User.hasMany(InventoryTransaction, {
    foreignKey: "userId",
    as: "inventoryTransactions",
});
InventoryTransaction.belongsTo(User, { foreignKey: "userId", as: "user" });

/* ---------------------------------------------------------------- */
/* Shift <-> Employee (through ShiftAssignment)                      */
/* ---------------------------------------------------------------- */
Shift.hasMany(ShiftAssignment, { foreignKey: "shiftId", as: "assignments" });
ShiftAssignment.belongsTo(Shift, { foreignKey: "shiftId", as: "shift" });

Employee.hasMany(ShiftAssignment, {
    foreignKey: "employeeId",
    as: "shiftAssignments",
});
ShiftAssignment.belongsTo(Employee, {
    foreignKey: "employeeId",
    as: "employee",
});

Shift.belongsToMany(Employee, {
    through: ShiftAssignment,
    foreignKey: "shiftId",
    otherKey: "employeeId",
    as: "employees",
});
Employee.belongsToMany(Shift, {
    through: ShiftAssignment,
    foreignKey: "employeeId",
    otherKey: "shiftId",
    as: "shifts",
});

Shift.belongsTo(User, { foreignKey: "closedBy", as: "closedByUser" });

/* ---------------------------------------------------------------- */
/* Invoice <-> User / Shift / InvoiceDetail                          */
/* ---------------------------------------------------------------- */
User.hasMany(Invoice, { foreignKey: "userId", as: "invoices" });
Invoice.belongsTo(User, { foreignKey: "userId", as: "employee" });

Invoice.belongsTo(User, { foreignKey: "cancelledBy", as: "cancelledByUser" });

Shift.hasMany(Invoice, { foreignKey: "shiftId", as: "invoices" });
Invoice.belongsTo(Shift, { foreignKey: "shiftId", as: "shift" });

Invoice.hasMany(InvoiceDetail, {
    foreignKey: "invoiceId",
    as: "details",
    onDelete: "CASCADE",
});
InvoiceDetail.belongsTo(Invoice, { foreignKey: "invoiceId", as: "invoice" });

Product.hasMany(InvoiceDetail, {
    foreignKey: "productId",
    as: "invoiceDetails",
});
InvoiceDetail.belongsTo(Product, { foreignKey: "productId", as: "product" });

/* ---------------------------------------------------------------- */
/* PrintOrder <-> User / Shift / PrintOrderDetail                    */
/* ---------------------------------------------------------------- */
User.hasMany(PrintOrder, { foreignKey: "createdBy", as: "printOrders" });
PrintOrder.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

Shift.hasMany(PrintOrder, { foreignKey: "shiftId", as: "printOrders" });
PrintOrder.belongsTo(Shift, { foreignKey: "shiftId", as: "shift" });

PrintOrder.hasMany(PrintOrderDetail, {
    foreignKey: "printOrderId",
    as: "details",
    onDelete: "CASCADE",
});
PrintOrderDetail.belongsTo(PrintOrder, {
    foreignKey: "printOrderId",
    as: "printOrder",
});

/* ---------------------------------------------------------------- */
/* ActivityLog <-> User                                              */
/* ---------------------------------------------------------------- */
User.hasMany(ActivityLog, { foreignKey: "userId", as: "activityLogs" });
ActivityLog.belongsTo(User, { foreignKey: "userId", as: "user" });
/* ---------------------------------------------------------------- */
/* BankTransaction <-> Invoice                                       */
/* ---------------------------------------------------------------- */
Invoice.hasOne(BankTransaction, { foreignKey: "invoiceId", as: "bankTransaction" });
BankTransaction.belongsTo(Invoice, { foreignKey: "invoiceId", as: "invoice" });

module.exports = {
    sequelize,
    Role,
    User,
    Employee,
    Category,
    Product,
    InventoryTransaction,
    Shift,
    ShiftAssignment,
    Invoice,
    InvoiceDetail,
    PrintOrder,
    PrintOrderDetail,
    ActivityLog,
    BankTransaction,
};