const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.showRegisterForm = (req, res) => {
  res.render("register");
};

exports.registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: username },
    });

    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
      },
    });

    // Create a root directory for the user
    const rootDirectory = await prisma.directory.create({
      data: {
        name: "Root",
        userId: user.id,
      },
    });

    res.redirect("/auth/login");
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.showLoginForm = (req, res) => {
  res.render("login");
};

exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};
