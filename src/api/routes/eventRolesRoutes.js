const express = require("express");
const router = express.Router();
const { validateUserIsAdmin } = require("../middlewares/authMiddleware");
const { isEventOwner } = require("../middlewares/eventMiddleware");
const {
  assignRole,
  getRoles,
  acceptRole,
  removeRole,
} = require("../controllers/eventRolesController");

router.route("/invitations/accept").get(acceptRole);

router.use(validateUserIsAdmin);

router.route("/available").get(getRoles);

router.route("/assign").post(isEventOwner, assignRole);

router.route("/remove").post(isEventOwner, removeRole);

module.exports = router;
