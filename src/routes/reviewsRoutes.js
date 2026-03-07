const { getAllReviews } = require("../controllers/reviewController");

const router = require("express").Router();

router.get("/", getAllReviews);

// router.post("/", createReview);
// router.get("/:id", getReviewById);
// router.put("/:id", updateReview);
// router.patch("/:id", patchReview);
// router.delete("/:id", deleteReview);

module.exports = router;
