const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");

exports.uploadFile = async (req, res) => {
  const file = req.file;
  const userId = req.userId;
  const directoryId = req.body.directoryId
    ? parseInt(req.body.directoryId)
    : null;

  const newFile = await prisma.file.create({
    data: {
      filename: file.originalname,
      path: file.path,
      userId: userId,
      directoryId: directoryId,
    },
  });

  res.send(newFile);
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
