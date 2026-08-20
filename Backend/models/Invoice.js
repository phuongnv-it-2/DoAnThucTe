const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Invoice extends Model { }

Invoice.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        invoiceCode: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            comment: "Employee/cashier who created the invoice",
        },
        shiftId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "shifts",
                key: "id",
            },
        },
        customerName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        customerPhone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        subtotal: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
            defaultValue: 0,
        },
        discount: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
            defaultValue: 0,
        },
        total: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
            defaultValue: 0,
        },
        paymentMethod: {
            type: DataTypes.ENUM("CASH", "TRANSFER"),
            allowNull: false,
            defaultValue: "CASH",
        },
        status: {
            type: DataTypes.ENUM(
                "PENDING_PAYMENT",
                "COMPLETED",
                "CANCELLED"
            ),
            allowNull: false,
            defaultValue: "COMPLETED",
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        cancelledAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        cancelledBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        cancelReason: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "Invoice",
        tableName: "invoices",
        timestamps: true,
    }
);

module.exports = Invoice;