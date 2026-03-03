const { fetchDistanceMatrix, fetchAddOnsAndDiscount, fetchFilterData, fetchAllBrands, fetchAllBlogs } = require("../controllers/fetchController");

const router = require("express").Router();

router.post("/distance-between", fetchDistanceMatrix);

router.get("/addons-discounts-data", fetchAddOnsAndDiscount);

router.get("/filter-data", fetchFilterData);

router.get("/brands", fetchAllBrands);

router.get("/blogs", fetchAllBlogs);

module.exports = router;
