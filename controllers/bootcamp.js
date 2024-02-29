const path = require('path');
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let selectQuery, sortQuery;
  let queryObj = { ...req.query };
  const pagination = {};
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  let removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach((item) => delete queryObj[item]);
  let queryStr = JSON.stringify(queryObj);
  let query = JSON.parse(
    queryStr.replace(/\b[gt, gte, lt, lte, in]\b/, (match) => `$${match}`)
  );
  if (req.query.select) selectQuery = req.query.select.split(",").join(" ");
  if (req.query.sort) sortQuery = req.query.sort.split(",").join(" ");
  let response = await Bootcamp.find(query)
    .select(selectQuery)
    .sort(sortQuery)
    .skip(startIndex)
    .limit(limit);
  res.status(200).json({
    success: true,
    count: response.length,
    msg: "Show all bootcamps",
    pagination,
    data: response,
  });
});

const bootcampError = (msg, code, next) => {
  const error = { name: "LoginError" };
  (error.message = msg), (error.code = code);
  return next(error);
};

exports.fileUpload = asyncHandler(async (req, res, next) => {
  const response = await Bootcamp.findById(req.params.id);
  if (!response) bootcampError(
    `Bootcamp with id ${req.params.id} does not exist`, 400, next
  );
  else {
    if (!req.files) bootcampError('PLease upload a file', 400, next);
    else {
      const file = req.files.file;
      if (file.mimetype.startsWith('image')) {
        file.name = `photo_${response._id}${path.parse(file.name).ext}`;
        file.mv(`./public/uploads/${file.name}`, async err => {
          if (err) bootcampError('Problem with file upload', 500, next);
          else {
            await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
            res.status(200).json({ success: true, data: file.name });
          }
        });
      }
      else bootcampError('Please upload an image file', 400, next);
    }
  }
});

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const response = await Bootcamp.findById(req.params.id);
  if (!response)
    return res.status(400).json({
      success: false,
      msg: `Bootcamp with id ${req.params.id} does not exist`,
    });
  res.status(200).json({ success: true, data: response });
});

exports.createBootcamps = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const publishedUser = await Bootcamp.find({ user: req.user.id });
  if (publishedUser.length > 0 && req.user.role !== "admin")
    bootcampError(
      `The user with ID ${req.user.id} has already published a bootcamp`,
      400,
      next
    );
  else {
    const response = await Bootcamp.create(req.body);
    res
      .status(201)
      .json({ success: true, msg: "Created new bootcamp", data: response });
  }
});

exports.updateBootcamps = asyncHandler(async (req, res, next) => {
  let response = await Bootcamp.findById(req.params.id);
  if (!response)
    return res.status(400).json({
      success: false,
      msg: `Bootcamp with id ${req.params.id} does not exist`,
    });

  if (response.user.toString() !== req.user.id && req.user.role !== 'admin')
  bootcampError(
    `The user with ID ${req.user.id} does not have permission to update this bootcamp`,
    401,
    next
  );
  else {
    response = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      msg: `Updated bootcamp ${req.params.id}`,
      data: response,
    });
  }
});

exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
  const response = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!response)
    return res.status(400).json({
      success: false,
      msg: `Bootcamp with id ${req.params.id} does not exist`,
    });
  res.status(200).json({
    success: true,
    msg: `Deleted bootcamp ${req.params.id}`,
    data: {},
  });
});
