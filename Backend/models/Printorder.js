const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class PrintOrder extends Model { }

PrintOrder.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        orderCode: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        customerName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        customerPhone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        serviceType: {
            type: DataTypes.ENUM(
                "PHOTOCOPY",
                "PRINT_BLACK_WHITE",
                "PRINT_COLOR",
                "SCAN",
                "BINDING",
                "LAMINATING"
            ),
            allowNull: false,
        },
        paperSize: {
            type: DataTypes.STRING(10),
            allowNull: true,
            comment: "e.g. A4, A3, A5",
        },
        colorMode: {
            type: DataTypes.ENUM("BLACK_WHITE", "COLOR"),
            allowNull: false,
            defaultValue: "BLACK_WHITE",
        },
        numberOfPages: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        numberOfCopies: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        unitPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
        },
        totalAmount: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM(
                "PENDING",
                "PROCESSING",
                "COMPLETED",
                "DELIVERED",
                "CANCELLED"
            ),
            allowNull: false,
            defaultValue: "PENDING",
        },
        shiftId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "shifts",
                key: "id",
            },
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "PrintOrder",
        tableName: "print_orders",
        timestamps: true,
    }
);

module.exports = PrintOrder;