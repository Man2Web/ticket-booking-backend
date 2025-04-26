const express = require("express");
const router = express.Router();
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

router.use(isEventOwner);

router.route("/roles/:eventId").get(getAvailableRolesForEvent);

router.route("/:eventId/staff").post(assignStaff);

router.route("/:eventId/staff/:userRoleId").delete(removeStaff);

module.exports = router;
