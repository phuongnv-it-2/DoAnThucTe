const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Product extends Model { }

Product.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        sku: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        barcode: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "categories",
                key: "id",
            },
        },
        costPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
        },
        sellingPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        minStock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5,
            comment: "Threshold used to flag low-stock products",
        },
        unit: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "cái",
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
            allowNull: false,
            defaultValue: "ACTIVE",
        },
    },
    {
        sequelize,
        modelName: "Product",
        tableName: "products",
        timestamps: true,
        indexes: [{ fields: ["name"] }, { fields: ["categoryId"] }],
    }
);

module.exports = Product;