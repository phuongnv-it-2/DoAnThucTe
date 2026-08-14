const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class ShiftAssignment extends Model { }

ShiftAssignment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        shiftId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "shifts",
                key: "id",
            },
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "employees",
                key: "id",
            },
        },
        role: {
            type: DataTypes.ENUM("CASHIER", "SUPPORT", "SUPERVISOR"),
            allowNull: false,
            defaultValue: "CASHIER",
        },
        checkInAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        checkOutAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("ASSIGNED", "CHECKED_IN", "CHECKED_OUT"),
            allowNull: false,
            defaultValue: "ASSIGNED",
        },
    },
    {
        sequelize,
        modelName: "ShiftAssignment",
        tableName: "shift_assignments",
        timestamps: true,
        indexes: [{ unique: true, fields: ["shiftId", "employeeId"] }],
    }
);

module.exports = ShiftAssignment;