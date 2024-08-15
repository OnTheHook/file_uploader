const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.renderCreateDirectoryPage = async (req, res) => {
  const userId = req.user.id;

  // Fetch all directories belonging to the user
  const directories = await prisma.directory.findMany({
    where: { userId },
  });

  res.render("create-directory", { directories, user: req.user.id });
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

  res.render("files", { currentDirectory: directory, user: req.user.id });
};

// Update a directory's name
exports.updateDirectory = async (req, res) => {
  const { id, name } = req.body;
  const userId = req.user.id;

  const directory = await prisma.directory.findUnique({
    where: { id: parseInt(id) },
  });

  if (!directory || directory.userId !== userId) {
    return res.status(403).send("Access denied");
  }

  const updatedDirectory = await prisma.directory.update({
    where: { id: directory.id },
    data: { name },
  });

  res.send(updatedDirectory);
};

// Delete a directory and its contents
exports.deleteDirectory = async (req, res) => {
  const directoryId = parseInt(req.params.id);
  const userId = req.userId;

  const directory = await prisma.directory.findUnique({
    where: { id: directoryId },
  });

  if (!directory || directory.userId !== userId) {
    return res.status(403).send("Access denied");
  }

  if (directory.files || directory.children) {
    return res.send(
      "Delete all files and folders in directory before deleting it"
    );
  }
  // Delete directory and all associated files and subdirectories
  await prisma.directory.delete({
    where: { id: directoryId },
  });

  res.send({ message: "Directory deleted successfully" });
};
