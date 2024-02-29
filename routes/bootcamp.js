const express = require("express");
const router = express.Router();
const {
  getBootcamps,
  getBootcamp,
  createBootcamps,
  updateBootcamps,
  deleteBootcamps,
  fileUpload
} = require("../controllers/bootcamp");
const { protect } = require('../middleware/auth');
const { authorize } = require("../controllers/auth");
const reviewRouter = require('./reviews');

router.use('/:bootcampId/reviews', reviewRouter);
router.route("/").get(protect, getBootcamps).post(protect, authorize('admin', 'user'), createBootcamps);
router.route('/:id/photo').put(fileUpload);
router
  .route("/:id")
  .get(protect, getBootcamp)
  .put(protect, authorize('admin', 'user'), updateBootcamps)
  .delete(protect, authorize('admin'), deleteBootcamps);

module.exports = router;
