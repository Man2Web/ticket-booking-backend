const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Payment = sequelize.define(
  "Payment",
  {
    paymentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "payment_id",
    },
    bookingId: {
      type: DataTypes.INTEGER,
      references: {
        model: "bookings",
        key: "booking_id",
      },
      allowNull: false,
      field: "booking_id",
    },
    transactionId: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      field: "transaction_id",
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "payment_method",
    },
    paymentStatus: {
      type: DataTypes.ENUM("SUCCESS", "FAILED", "PENDING", "REFUNDED"),
      allowNull: false,
      defaultValue: "PENDING",
      field: "payment_status",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      field: "updated_at",
    },
  },
  {
    timestamps: true,
    tableName: "payments",
    underscored: true,
  }
);

module.exports = Payment;
