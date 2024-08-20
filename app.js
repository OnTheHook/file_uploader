require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("./config/passportConfig");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const indexRoutes = require("./routes/index");
const fileRoutes = require("./routes/file");
const directoryRoutes = require("./routes/directory");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");

const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

// Express stuff
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Add Helmet to secure HTTP headers
app.use(helmet());

// Enable CORS if needed (adjust the options as per your requirements)
app.use(cors());

// Add request logging with Morgan
app.use(morgan("combined"));

// Compress all HTTP responses
app.use(compression());

// Set up a rate limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Passport and session middleware
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, //ms
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
    secret: process.env.SESSION_SECRET,
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
app.use(errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is listening on ${PORT}`);
});
