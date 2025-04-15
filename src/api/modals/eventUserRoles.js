const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db.config");

const EventUserRole = sequelize.define(
  "EventUserRole",
  {
    eventUserId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "event_user_id",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      field: "user_id",
      onDelete: "CASCADE",
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "role_id",
      },
      field: "role_id",
      onDelete: "CASCADE",
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "events",
        key: "event_id",
      },
      field: "event_id",
      onDelete: "CASCADE",
    },
    accepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "accepted",
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
    tableName: "event_user_roles",
    timestamps: true,
  }
);

module.exports = EventUserRole;
