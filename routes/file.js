const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.get(
  "/upload",
  auth.ensureAuthenticated,
  fileController.renderUploadPage
);
router.post(
  "/upload",
  auth.ensureAuthenticated,
  upload.single("file"),
  fileController.uploadFile
);
// router.get("/files", auth.ensureAuthenticated, fileController.getFiles);
router.get(
  "/files/delete/:id",
  auth.ensureAuthenticated,
  fileController.deleteFile
);
router.get(
  "/files/download/:id",
  auth.ensureAuthenticated,
  fileController.getFile
);
router.get(
  "/files/view/:id",
  auth.ensureAuthenticated,
  fileController.getFileDetails
);

module.exports = router;
