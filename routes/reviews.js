const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../controllers/auth");
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews");

router.use(protect);
router.use(authorize("admin", "user"));

router.route("/").get(getReviews);
router.route("/:bootcampId").post(addReview);
router.route("/:id").get(getReview).put(updateReview).delete(deleteReview);

module.exports = router;
