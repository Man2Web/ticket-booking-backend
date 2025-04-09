const Role = require("../modals/roles");
const UserRole = require("../modals/userRoles");
const User = require("../modals/users");
const Venue = require("../modals/venues");
const Event = require("../modals/events");

const dbAssociations = () => {
  // User-Role associations
  UserRole.belongsTo(Role, {
    foreignKey: "roleId",
    targetKey: "roleId", // Fixed: changed belongsTo to targetKey
  });

  Role.hasMany(UserRole, {
    foreignKey: "roleId",
    as: "userRoles",
  });

  UserRole.belongsTo(User, {
    foreignKey: "userId",
    targetKey: "userId",
  });

  User.hasMany(UserRole, {
    foreignKey: "userId",
    as: "userRoles",
  });

  // Event-Venue associations
  Event.belongsTo(Venue, {
    foreignKey: "venueId",
    as: "venue",
  });

  Venue.hasMany(Event, {
    foreignKey: "venueId",
    as: "events",
  });

  // Event-User (Admin) associations
  Event.belongsTo(User, {
    foreignKey: "adminId",
    targetKey: "userId", // Fixed: changed belongsTo to targetKey
    as: "admin",
  });

  User.hasMany(Event, {
    foreignKey: "adminId",
    as: "adminEvents",
  });
};

module.exports = dbAssociations;
