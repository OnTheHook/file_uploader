require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const prisma = new PrismaClient();

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

  const filePath = path.resolve(file.path);

  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(`public/${file.originalname}`, fs.createReadStream(filePath), {
      contentType: file.mimetype,
    });

  if (error) return res.status(400).json({ error });

  fs.unlinkSync(filePath);

  const newFile = await prisma.file.create({
    data: {
      filename: file.originalname,
      path: data.path,
      size: file.size,
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

  const { data, error } = await supabase.storage
    .from("uploads")
    .createSignedUrl(file.path, 60);

  if (error) return res.status(400).json({ error });

  res.redirect(data.signedUrl);
};

exports.getFileDetails = async (req, res) => {
  const fileId = parseInt(req.params.id);
  const userId = req.user.id;

  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: { Directory: true },
  });

  console.log(file);
  if (!file || file.userId !== userId) {
    return res.status(403).send("Access denied");
  }
  res.render("file-details", { file, user: req.user });
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
