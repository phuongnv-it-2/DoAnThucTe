const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class InvoiceDetail extends Model { }

InvoiceDetail.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        invoiceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "invoices",
                key: "id",
            },
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "products",
                key: "id",
            },
        },
        productName: {
            type: DataTypes.STRING(150),
            allowNull: false,
            comment: "Snapshot of product name at time of sale",
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unitPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: "Snapshot of selling price at time of sale",
        },
        discount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
        },
        total: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "InvoiceDetail",
        tableName: "invoice_details",
        timestamps: true,
    }
);

module.exports = InvoiceDetail;