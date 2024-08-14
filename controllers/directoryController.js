const prisma = require("../../prisma/client"); // Adjust path as needed

// Create a new directory
exports.createDirectory = async (req, res) => {
  const { name, parentId } = req.body;
  const userId = req.user.id;

  const directory = await prisma.directory.create({
    data: {
      name,
      userId,
      parentId: parentId ? parseInt(parentId) : null,
    },
  });

  res.send(directory);
};

// Read all directories and files within a directory
exports.getDirectoryContents = async (req, res) => {
  const directoryId = parseInt(req.params.id);
  const userId = req.user.id;

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

  res.send({ message: "Directory and its contents deleted successfully" });
};
