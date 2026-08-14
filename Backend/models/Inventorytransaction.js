const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class InventoryTransaction extends Model { }

InventoryTransaction.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "products",
                key: "id",
            },
        },
        type: {
            type: DataTypes.ENUM("IMPORT", "EXPORT", "ADJUST", "SALE", "CANCEL_SALE"),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Always stored positive; 'type' determines direction",
        },
        beforeStock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        afterStock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        referenceType: {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "e.g. INVOICE, MANUAL",
        },
        referenceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "Related invoice id / adjustment id, etc.",
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            comment: "Who performed the transaction",
        },
    },
    {
        sequelize,
        modelName: "InventoryTransaction",
        tableName: "inventory_transactions",
        timestamps: true,
        updatedAt: false,
    }
);

module.exports = InventoryTransaction;