const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register");
});
// Registration route
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username },
    });

    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user in the database
    const newUser = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
      },
    });

    res.redirect("/auth/login");
  } catch (err) {
    res.status(500).send("Server error");
  }
});
router.get("/login", (req, res) => {
  res.render("login");
});
// Login route
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
  })
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = router;
