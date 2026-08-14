const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class ActivityLog extends Model { }

ActivityLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        action: {
            type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "OTHER"),
            allowNull: false,
        },
        entity: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "e.g. Product, Invoice, Shift, User",
        },
        entityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        ipAddress: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "ActivityLog",
        tableName: "activity_logs",
        timestamps: true,
        updatedAt: false,
    }
);

module.exports = ActivityLog;