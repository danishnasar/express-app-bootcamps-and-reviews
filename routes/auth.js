const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateUser,
  updatePassword,
} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.put("/resetPassword/:resetToken", resetPassword);
router.put("/updateUser", protect, updateUser);
router.put("/updatePassword", protect, updatePassword);

module.exports = router;
