const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db.config");
const Role = require("./roles");
const User = require("./users");

const UserRole = sequelize.define(
  "UserRole",
  {
    userRoleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "user_role_id",
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
    tableName: "user_roles",
    timestamps: true,
  }
);

UserRole.belongsTo(Role, {
  foreignKey: "roleId",
  targetKey: "roleId",
});

UserRole.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "userId",
});

module.exports = UserRole;
