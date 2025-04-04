const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Permissions = sequelize.define("Permissions", {
  permissionId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "permission_id",
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: "name",
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: "description",
  },
});

module.exports = Permissions;
