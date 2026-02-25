const { fetchDistanceMatrix, fetchAddOnsAndDiscount, fetchFilterData, fetchAllBrands } = require("../controllers/fetchController");

const router = require("express").Router();

router.post("/distance-between", fetchDistanceMatrix);

router.get("/addons-discounts-data", fetchAddOnsAndDiscount);

router.get("/filter-data", fetchFilterData);

router.get("/brands", fetchAllBrands);


module.exports = router;
