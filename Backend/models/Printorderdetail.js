const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class PrintOrderDetail extends Model { }

PrintOrderDetail.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        printOrderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "print_orders",
                key: "id",
            },
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "e.g. 'In màu A4 - Tài liệu công ty'",
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        unitPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
        },
        total: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        modelName: "PrintOrderDetail",
        tableName: "print_order_details",
        timestamps: true,
    }
);

module.exports = PrintOrderDetail;