const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class BankTransaction extends Model { }

BankTransaction.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        gateway: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "Tên ngân hàng, VD: Vietcombank, ACB...",
        },
        transactionDate: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "Thời gian giao dịch thực tế do SePay báo về",
        },
        accountNumber: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        content: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: "Nội dung chuyển khoản gốc, dùng để đối soát mã hóa đơn",
        },
        transferType: {
            type: DataTypes.ENUM("in", "out"),
            allowNull: false,
            defaultValue: "in",
        },
        transferAmount: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
        },
        referenceCode: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
            comment: "Mã giao dịch ngân hàng (referenceCode từ SePay) - chặn xử lý trùng webhook",
        },
        sepayId: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "id giao dịch trong hệ thống SePay",
        },
        invoiceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "invoices",
                key: "id",
            },
            comment: "Hóa đơn được đối soát khớp (nếu tìm thấy)",
        },
        matchStatus: {
            type: DataTypes.ENUM("MATCHED", "UNMATCHED", "AMOUNT_MISMATCH"),
            allowNull: false,
            defaultValue: "UNMATCHED",
        },
        rawPayload: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "Toàn bộ JSON webhook gốc, phòng khi cần tra cứu lại",
        },
    },
    {
        sequelize,
        modelName: "BankTransaction",
        tableName: "bank_transactions",
        timestamps: true,
        updatedAt: false,
        indexes: [{ fields: ["transactionDate"] }, { fields: ["matchStatus"] }],
    }
);

module.exports = BankTransaction;