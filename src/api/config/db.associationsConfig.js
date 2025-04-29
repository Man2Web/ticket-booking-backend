const Role = require("../modals/roles");
const UserRole = require("../modals/userRoles");
const User = require("../modals/users");
const Venue = require("../modals/venues");
const Event = require("../modals/events");
const EventUserRole = require("../modals/eventUserRoles");
const Coupon = require("../modals/coupons");
const Booking = require("../modals/bookings");
const EventTickets = require("../modals/eventTickets");
const Tickets = require("../modals/tickets");

const dbAssociations = () => {
  UserRole.belongsTo(Role, {
    foreignKey: "roleId",
    targetKey: "roleId",
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

  Event.belongsTo(Venue, {
    foreignKey: "venueId",
    as: "venue",
  });

  Venue.hasMany(Event, {
    foreignKey: "venueId",
    as: "events",
  });

  Event.belongsTo(User, {
    foreignKey: "adminId",
    targetKey: "userId",
    as: "admin",
  });

  User.hasMany(Event, {
    foreignKey: "adminId",
    as: "adminEvents",
  });

  EventUserRole.belongsTo(User, {
    foreignKey: "userId",
    targetKey: "userId",
  });

  EventUserRole.belongsTo(Event, {
    foreignKey: "eventId",
    targetKey: "eventId",
  });

  EventUserRole.belongsTo(Role, {
    foreignKey: "roleId",
    targetKey: "roleId",
  });

  EventTickets.belongsTo(Event, {
    foreignKey: "eventId",
    targetKey: "eventId",
  });

  Coupon.belongsTo(Event, {
    foreignKey: "eventId",
    targetKey: "eventId",
  });

  Coupon.belongsTo(EventTickets, {
    foreignKey: "eventTicketId",
    targetKey: "eventTicketId",
  });

  Booking.belongsTo(User, {
    foreignKey: "userId",
    targetKey: "userId",
  });

  Booking.belongsTo(EventTickets, {
    foreignKey: "eventTicketId",
    targetKey: "eventTicketId",
  });

  Tickets.belongsTo(Booking, {
    foreignKey: "bookingId",
    targetKey: "bookingId",
  });

  Tickets.belongsTo(User, {
    foreignKey: "userId",
    targetKey: "userId",
  });

  Event.hasMany(EventTickets, {
    foreignKey: "event_id",
    as: "eventTickets",
  });
};

module.exports = dbAssociations;
