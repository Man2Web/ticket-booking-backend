const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const RolePermission = sequelize.define(
  "RolePermission",
  {
    roleId: {
      type: DataTypes.INTEGER,
      field: "role_id",
      references: {
        model: "roles",
        key: "role_id",
      },
    },
    permissionId: {
      type: DataTypes.INTEGER,
      field: "permission_id",
      references: {
        model: "permissions",
        key: "permission_id",
      },
    },
  },
  {
    name: "role_permissions",
  }
);

module.exports = RolePermission;
