const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.get("/upload", (req, res) => {
  res.render("upload", { user: req.user });
});

router.post(
  "/upload",
  auth.ensureAuthenticated,
  upload.single("file"),
  fileController.uploadFile
);
router.get("/files", auth.ensureAuthenticated, fileController.getFiles);
router.get("/files/:id", auth.ensureAuthenticated, fileController.getFile);

module.exports = router;
