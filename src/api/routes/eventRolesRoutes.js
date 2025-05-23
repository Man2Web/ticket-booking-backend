const express = require("express");
const router = express.Router({
  mergeParams: true,
});
const { validateUserIsAdmin } = require("../middlewares/authMiddleware");
const { isEventOwner } = require("../middlewares/eventMiddleware");
const {
  acceptInvitation,
  getAvailableRoles,
  assignStaff,
  removeStaff,
  getAvailableRolesForEvent,
} = require("../controllers/eventRolesController");

router.route("/invitations/:token").get(acceptInvitation);

router.use(validateUserIsAdmin);

router.route("/roles").get(getAvailableRoles);

router.route("/roles/:eventId").get(isEventOwner, getAvailableRolesForEvent);

router.route("/:eventId/staff").post(isEventOwner, assignStaff);

router.route("/:eventId/staff/:userRoleId").delete(isEventOwner, removeStaff);

module.exports = router;
