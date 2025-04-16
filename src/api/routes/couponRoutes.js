const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateUserIsAdmin } = require("../middlewares/authMiddleware");
const { isEventOwner } = require("../middlewares/eventMiddleware");
const {
  createCoupon,
  getCoupons,
  updateCoupon,
} = require("../controllers/couponController");
const { validateCoupon } = require("../middlewares/couponMiddleware");

router.route("/").get(getCoupons);

router.use(validateUserIsAdmin);

router.route("/").post(isEventOwner, validateCoupon, createCoupon);

router.route("/:couponId").put(isEventOwner, validateCoupon, updateCoupon);

module.exports = router;
