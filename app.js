const express = require("express");
const session = require("express-session");
const passport = require("./config/passportConfig");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const indexRoutes = require("./routes/index");
const fileRoutes = require("./routes/file");
const directoryRoutes = require("./routes/directory");
const path = require("path");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");

// Express stuff
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Passport and session middleware
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, //ms
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
    secret: "a santa at nasa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/", indexRoutes);
app.use("/", fileRoutes);
app.use("/", directoryRoutes);
app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App is listening on ${PORT}`);
});
