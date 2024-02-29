const User = require("../models/User");
const asyncHandler = require("../middleware/async");

const userError = (msg, code, next) => {
  const error = { name: "LoginError" };
  (error.message = msg), (error.code = code);
  return next(error);
};

exports.getUsers = asyncHandler(async (req, res, next) => {
  const user = await User.find();
  if (!user) userError("No Users exist", 404, next);
  else res.status(200).json({ success: true, count: user.length, data: user });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) userError("User does not exist", 404, next);
  else res.status(200).json({ success: true, data: user });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({ success: true, data: user });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) userError("User does not exist", 400, next);
  else res.status(200).json({ success: true, data: user });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) userError("User does not exist", 400, next);
  else {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: [] });
  }
});
