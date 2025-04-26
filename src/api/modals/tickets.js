const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Tickets = sequelize.define(
  "Tickets",
  {
    ticketId: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      field: "ticket_id",
    },
    bookingId: {
      references: {
        model: "bookings",
        key: "booking_id",
      },
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "booking_id",
    },
    userId: {
      references: {
        model: "users",
        key: "user_id",
      },
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    ticketCode: {
      type: DataTypes.STRING(150),
      unique: true,
      allowNull: false,
      field: "ticket_code",
    },
    ticketStatus: {
      type: DataTypes.ENUM("VALID", "SCANNED", "CANCELLED"),
      allowNull: false,
      field: "ticket_code",
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
    tableName: "tickets",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Tickets;
