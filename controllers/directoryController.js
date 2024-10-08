const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getFullPath } = require("../utils/directoryHelper");

exports.renderCreateDirectoryPage = async (req, res) => {
  const userId = req.user.id;

  // Fetch all directories belonging to the user
  const directories = await prisma.directory.findMany({
    where: { userId },
  });

  res.render("create-directory", { directories, user: req.user });
};

// Render the manage directory page
exports.renderManageDirectoryPage = async (req, res) => {
  const userId = req.user.id;
  const directoryId = parseInt(req.params.id);

  const directory = await prisma.directory.findUnique({
    where: { id: directoryId },
  });

  if (!directory || directory.userId !== userId) {
    return res.status(403).send("Access denied");
  }

  res.render("manage-directory", { directory, user: req.user });
};

// Create a new directory
exports.createDirectory = async (req, res) => {
  const { directoryName, parentId } = req.body;
  const userId = req.user.id;

  // Create the new directory
  await prisma.directory.create({
    data: {
      name: directoryName,
      userId: userId,
      parentId: parentId ? parseInt(parentId) : null, // Parent ID, or null if root
    },
  });

  res.redirect("/directory"); // Redirect back to the files page after creation
};

// Read all directories and files within a directory
exports.getDirectoryContents = async (req, res) => {
  const userId = req.user.id;

  // Check if the user has a root directory
  let rootDirectory = await prisma.directory.findFirst({
    where: {
      userId: userId,
      parentId: null, // Ensures it's a root directory
    },
  });

  // If no root directory exists, create one
  if (!rootDirectory) {
    rootDirectory = await prisma.directory.create({
      data: {
        name: "Root",
        userId: userId,
      },
    });
  }

  // Get the directory contents (files and subdirectories)
  const directoryId = req.params.id
    ? parseInt(req.params.id)
    : rootDirectory.id;
  const directory = await prisma.directory.findUnique({
    where: { id: directoryId },
    include: {
      files: true,
      children: true,
    },
  });

  if (!directory || directory.userId !== userId) {
    return res.status(403).send("Access denied");
  }

  let fullPath =
    directory.name === "Root" ? "Root" : await getFullPath(directory, prisma);

  res.render("files", {
    currentDirectory: directory,
    user: req.user,
    fullPath,
  });
};

// Update a directory's name
exports.updateDirectory = async (req, res) => {
  const directoryId = parseInt(req.params.id);
  const userId = req.user.id;
  const { directoryName } = req.body;

  const directory = await prisma.directory.findUnique({
    where: { id: directoryId },
  });

  if (!directory || directory.userId !== userId) {
    return res.status(403).send("Access denied");
  }

  await prisma.directory.update({
    where: { id: directoryId },
    data: { name: directoryName },
  });

  res.redirect("/directory");
};

// Delete a directory
exports.deleteDirectory = async (req, res) => {
  const directoryId = parseInt(req.params.id);
  const userId = req.user.id;

  const directory = await prisma.directory.findUnique({
    where: { id: directoryId },
    include: { files: true, children: true },
  });

  if (!directory || directory.userId !== userId) {
    return res.status(403).send("Access denied");
  }
  if (directory.parentId === null) {
    return res.send("Cannot delete root directory.");
  }

  if (directory.files.length > 0 || directory.children.length > 0) {
    return res.send(
      "Delete all files and folders in directory before deleting it."
    );
  }
  await prisma.directory.delete({
    where: { id: directoryId },
  });

  res.redirect("/directory");
};
