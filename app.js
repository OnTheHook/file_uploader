const express = require("express");
const session = require("express-session");
const passport = require("./config/passportConfig");
const authRoutes = require("./routes/auth");
const indexRoutes = require("./routes/index");
const path = require("path");

// Express stuff
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Passport and session middleware
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/", indexRoutes);
app.use("/auth", authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App is listening on ${PORT}`);
});
