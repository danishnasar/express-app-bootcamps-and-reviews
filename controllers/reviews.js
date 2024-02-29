const Review = require("../models/Review");
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");

const reviewError = (msg, code, next) => {
  const error = { name: "LoginError" };
  (error.message = msg), (error.code = code);
  return next(error);
};

exports.getReviews = asyncHandler(async (req, res, next) => {
  let reviews;
  if (req.params.bootcampId)
    reviews = await Review.find({ bootcampId: req.params.bootcampId });
  else reviews = await Review.find();
  if (!reviews) reviewError("No Reviews exist", 404, next);
  else
    res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const reviews = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!reviews)
    reviewError(`No review found with id of ${req.params.id}`, 404, next);
  else res.status(200).json({ success: true, data: reviews });
});

exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp)
    reviewError(
      `No bootcamp with id of ${req.params.bootcampId} exist`,
      404,
      next
    );
  else {
    const reviews = await Review.create(req.body);

    res.status(201).json({ success: true, data: reviews });
  }
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  let reviews = await Review.findById(req.params.id);
  if (!reviews) reviewError(`No review exist for the id ${req.params.id}`, 404, next);
  else {
    if (reviews.user.toString() !== req.user.id && req.user.id !== "admin")
      reviewError("Not authorized to update", 401, next);
    else {
      reviews = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      res.status(200).json({ success: true, data: reviews });
    }
  }
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const reviews = await Review.findById(req.params.id);
  if (!reviews) reviewError("Review does not exist", 404);
  else {
    if (reviews.user.toString() !== req.user.id && req.user.id !== "admin")
      reviewError("Not authorized to update", 401, next);
    else {
      await Review.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, data: [] });
    }
  }
});
