const validateCoupon = async (req, res, next) => {
  try {
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
    if (
      !couponCode ||
      !couponName ||
      !couponDescription ||
      !discountType ||
      !discountValue ||
      !maxDiscount ||
      !minPurchaseAmount ||
      !startTime ||
      !endTime
    )
      return res
        .status(403)
        .json({ message: "Required Parameters are missing" });
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { validateCoupon };
