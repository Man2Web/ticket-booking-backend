const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db.config");
const Ticket = require("./tickets");

const Coupon = sequelize.define(
  "Coupon",
  {
    couponId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "coupon_id",
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "events",
        key: "event_id",
      },
      onDelete: "CASCADE",
      field: "event_id",
    },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "tickets",
        key: "ticket_id",
      },
      field: "ticket_id",
    },
    couponCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: "coupon_code",
    },
    couponName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "coupon_name",
    },
    couponDescription: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: "coupon_description",
    },
    discountType: {
      type: DataTypes.ENUM("PERCENTAGE", "FIXED"),
      allowNull: false,
      field: "discount_type",
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "discount_value",
    },
    maxDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "max_discount",
    },
    minPurchaseAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "min_purchase_amount",
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "usage_count",
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "start_time",
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "end_time",
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
    tableName: "coupons",
  }
);

module.exports = Coupon;
