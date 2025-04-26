const express = require("express");
const {
  getAllAdmins,
  getAdmin,
  addAdmin,
  removeAdmin,
} = require("../controllers/adminController");
const { validateUserIsSuperAdmin } = require("../middlewares/authMiddleware");
const router = express();

router.use(validateUserIsSuperAdmin);

router.route("/").get(getAllAdmins);

router.route("/:userId").get(getAdmin);

router.route("/add/:userId").post(addAdmin);

router.route("/remove/:userId").put(removeAdmin);

module.exports = router;
