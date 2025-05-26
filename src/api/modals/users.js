const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const User = sequelize.define(
  "User",
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "user_id",
    },
    fName: {
      type: DataTypes.STRING(150),
      field: "f_name",
    },
    lName: {
      type: DataTypes.STRING(150),
      field: "l_name",
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      field: "email",
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      field: "phone",
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "address",
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "city",
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "pincode",
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "state",
    },
    country: {
      type: DataTypes.STRING(100),
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
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

module.exports = User;
