const express = require("express");
const router = express.Router();
const directoryController = require("../controllers/directoryController");
const auth = require("../middleware/authMiddleware");

router.get(
  "/directory",
  auth.ensureAuthenticated,
  directoryController.getDirectoryContents
);
router.post(
  "/directory",
  auth.ensureAuthenticated,
  directoryController.createDirectory
);
router.get(
  "/directory/create",
  auth.ensureAuthenticated,
  directoryController.renderCreateDirectoryPage
);
router.post(
  "/directory/create",
  auth.ensureAuthenticated,
  directoryController.createDirectory
);
router.get(
  "/directory/:id",
  auth.ensureAuthenticated,
  directoryController.getDirectoryContents
);
router.put(
  "/directory",
  auth.ensureAuthenticated,
  directoryController.updateDirectory
);
router.delete(
  "/directory/:id",
  auth.ensureAuthenticated,
  directoryController.deleteDirectory
);
router.get(
  "/directory/manage/:id",
  auth.ensureAuthenticated,
  directoryController.renderManageDirectoryPage
);
router.post(
  "/directory/update/:id",
  auth.ensureAuthenticated,
  directoryController.updateDirectory
);
router.post(
  "/directory/delete/:id",
  auth.ensureAuthenticated,
  directoryController.deleteDirectory
);
module.exports = router;
