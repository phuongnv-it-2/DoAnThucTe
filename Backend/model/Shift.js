const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Shift extends Model { }

Shift.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        shiftCode: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "e.g. Ca 1, Ca 2, Ca 3",
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        actualStartAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        actualEndAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("SCHEDULED", "IN_PROGRESS", "COMPLETED"),
            allowNull: false,
            defaultValue: "SCHEDULED",
        },
        totalRevenue: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
            defaultValue: 0,
        },
        cashAmount: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
            defaultValue: 0,
        },
        transferAmount: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
            defaultValue: 0,
        },
        invoiceCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        actualCash: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: true,
            comment: "Cash counted physically at shift close",
        },
        difference: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: true,
            comment: "actualCash - cashAmount",
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        closedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "Shift",
        tableName: "shifts",
        timestamps: true,
    }
);

module.exports = Shift;