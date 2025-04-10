const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Venue = sequelize.define(
  "Venue",
  {
    venueId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "venue_id",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "name",
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "address",
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "city",
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "state",
    },
    zip: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "zip",
    },
    country: {
      type: DataTypes.STRING(2),
      allowNull: false,
      field: "country",
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
    tableName: "venues",
    timestamps: true,
  }
);

module.exports = Venue;
