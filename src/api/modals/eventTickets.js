const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db.config");

const EventTickets = sequelize.define(
  "EventTickets",
  {
    eventTicketId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "event_ticket_id",
    },
    eventId: {
      type: DataTypes.INTEGER,
      references: {
        model: "events",
        key: "event_id",
      },
      allowNull: false,
      onDelete: "CASCADE",
      field: "event_id",
    },
    ticketName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "ticket_name",
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "price",
    },
    keyPoints: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      field: "key_points",
    },
    availableQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "available_quantity",
    },
    soldQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "sold_quantity",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
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
    tableName: "event_tickets",
  }
);

module.exports = EventTickets;
