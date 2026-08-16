const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../config/database");

const SALT_ROUNDS = 10;

class User extends Model {
    /** Compare a plaintext password against the stored hash. */
    async comparePassword(plainPassword) {
        return bcrypt.compare(plainPassword, this.password);
    }

    /** Safe JSON representation - never leak the password hash. */
    toSafeJSON() {
        const values = { ...this.get() };
        delete values.password;
        delete values.resetPasswordToken;
        delete values.resetPasswordExpires;
        return values;
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: { notEmpty: true, len: [3, 50] },
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        fullName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "roles",
                key: "id",
            },
        },
        status: {
            type: DataTypes.ENUM("ACTIVE", "LOCKED"),
            allowNull: false,
            defaultValue: "ACTIVE",
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        resetPasswordToken: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
                }
            },
        },
    }
);

module.exports = User;