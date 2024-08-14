const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware.ensureAuthenticated, (req, res) => {
  console.log(req.user);
  res.send("You are in a protected route");
});

module.exports = router;
