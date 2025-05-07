const { where } = require("sequelize");
const Coupon = require("../modals/coupons");

const createCoupon = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      couponCode,
      couponName,
      couponDescription,
      discountType,
      discountValue,
      maxDiscount,
      minPurchaseAmount,
      startTime,
      endTime,
    } = req.body;

    await Coupon.create({
      eventId,
      couponCode,
      couponName,
      couponDescription,
      discountType,
      discountValue,
      maxDiscount,
      minPurchaseAmount,
      startTime,
      endTime,
    });

    return res.status(200).json({ message: "Coupon Created Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { eventId, couponId } = req.params;
    const {
      couponName,
      couponDescription,
      discountType,
      discountValue,
      maxDiscount,
      minPurchaseAmount,
      startTime,
      endTime,
      isActive,
    } = req.body;

    const existingCoupon = await Coupon.findByPk(couponId);

    if (!existingCoupon)
      return res.status(404).json({ message: "Coupon Does Not Exist" });

    await Coupon.update(
      {
        couponName,
        couponDescription,
        discountType,
        discountValue,
        maxDiscount,
        minPurchaseAmount,
        startTime,
        endTime,
        isActive,
      },
      {
        where: {
          eventId,
          couponId,
        },
      }
    );
    return res.status(200).json({ message: "Coupon Updated Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getCoupons = async (req, res) => {
  try {
    const { eventId } = req.params;
    const couponsData = await Coupon.findAll({
      where: {
        eventId,
      },
      order: [["couponId", "ASC"]],
    });
    return res.status(200).json({ data: couponsData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getCoupon = async (req, res) => {
  try {
    const { eventId, couponId } = req.params;
    if (!eventId || !couponId)
      return res
        .status(404)
        .json({ message: "Required Parameters Are Missing" });
    const data = await Coupon.findOne({
      where: { eventId, couponId },
    });
    if (!data)
      return res.status(400).json({ message: "Coupon Does Not Exist" });
    return res.status(200).json({ data: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createCoupon, updateCoupon, getCoupons, getCoupon };
