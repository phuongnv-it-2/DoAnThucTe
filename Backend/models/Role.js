const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Role extends Model { }

Role.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.ENUM("ADMIN", "MANAGER", "STAFF"),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "Role",
        tableName: "roles",
        timestamps: true,
    }
);

module.exports = Role;