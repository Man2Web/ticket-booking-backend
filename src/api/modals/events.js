const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db.config");
const User = require("./users");
const Venue = require("./venues");

const Event = sequelize.define(
  "Event",
  {
    eventId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "event_id",
    },
    adminId: {
      type: DataTypes.INTEGER,
      field: "admin_id",
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    venueId: {
      type: DataTypes.INTEGER,
      field: "venue_id",
      references: {
        modal: Venue,
        key: "venue_id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "name",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "description",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "start_date",
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "end_date",
    },
    bookingDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "booking_date",
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "is_online",
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "category",
    },
    bannerImage: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "banner_image",
    },
    mainImage: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "main_image",
    },
    galleryImages: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true, // Make it optional
      defaultValue: [],
      field: "gallery_images",
    },
    faq: {
      type: DataTypes.JSONB(),
      allowNull: false,
      field: "faq",
    },
    termsAndConditions: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      field: "terms_and_conditions",
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
    tableName: "events",
    timestamps: true,
  }
);

module.exports = Event;
