const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Otp = sequelize.define(
  "Otp",
  {
    otpId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "otp_id",
    },
    userId: {
      type: DataTypes.INTEGER,
      field: "user_id",
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    otp: {
      type: DataTypes.STRING(4),
      allowNull: false,
      field: "otp",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      field: "created_at",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      field: "expires_at",
      validate: {
        isAfterCreation(value) {
          if (value <= this.createdAt) {
            throw new Error("Expiry time must be after creation time");
          }
        },
      },
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_used",
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    tableName: "otps",
    timestamps: false,
  }
);

module.exports = Otp;
