const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Booking = sequelize.define(
  "Booking",
  {
    bookingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "booking_id",
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "user_id",
      },
      allowNull: false,
      field: "user_id",
    },
    eventId: {
      type: DataTypes.INTEGER,
      references: {
        model: "events",
        key: "event_id",
      },
      allowNull: false,
      field: "event_id",
    },
    ticketId: {
      type: DataTypes.INTEGER,
      references: {
        model: "tickets",
        key: "ticket_id",
      },
      allowNull: false,
      field: "ticket_id",
    },
    paymentStatus: {
      type: DataTypes.ENUM("SUCCESS", "FAILED", "PENDING"),
      allowNull: false,
      field: "payment_status",
    },
    transactionId: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      field: "transaction_id",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "total_amount",
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
    tableName: "bookings",
    underscored: true,
  }
);

module.exports = Booking;
