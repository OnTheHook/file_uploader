const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");

// Render the upload page with a dropdown of directories
exports.renderUploadPage = async (req, res) => {
  const userId = req.user.id;

  // Fetch all directories belonging to the user
  const directories = await prisma.directory.findMany({
    where: { userId },
  });

  res.render("upload", { directories, user: req.user });
};

// Upload a file to the selected directory or root if none is selected
exports.uploadFile = async (req, res) => {
  const file = req.file;
  const userId = req.user.id;
  const directoryId = req.body.directoryId
    ? parseInt(req.body.directoryId)
    : null;

  // If no directoryId is provided, default to the user's root directory
  const targetDirectoryId =
    directoryId ||
    (
      await prisma.directory.findFirst({
        where: { userId, parentId: null },
      })
    ).id;

  const newFile = await prisma.file.create({
    data: {
      filename: file.originalname,
      path: file.path,
      userId: userId,
      directoryId: targetDirectoryId,
    },
  });

  res.redirect("/directory"); // Redirect to the files page after upload
};

exports.getFiles = async (req, res) => {
  const userId = req.user.id;
  const files = await prisma.file.findMany({ where: { userId } });
  res.render("files", { files, user: req.user });
};

exports.getFile = async (req, res) => {
  const fileId = parseInt(req.params.id);
  const userId = req.user.id;

  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (file.userId !== userId) {
    return res.status(403).send("Access denied");
  }

  res.download(file.path, file.filename);
};

exports.getFileDetails = async (req, res) => {
  const fileId = parseInt(req.params.id);
  const userId = req.user.id;

  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file || file.userId !== userId) {
    return res.status(403).send("Access denied");
  }
};

exports.deleteFile = async (req, res) => {
  const userId = req.user.id;
  const fileId = parseInt(req.params.id);

  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file || file.userId !== userId) {
    return res.status(403).send("Access denied");
  }
  const fileDirectory = file.directoryId;

  await prisma.file.delete({
    where: { id: fileId },
  });

  res.redirect(`/directory/${fileDirectory}`);
};
