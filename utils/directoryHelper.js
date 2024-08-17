const getFullPath = async (directory, prisma) => {
  let path = [];
  let currentId = directory.id;

  while (currentId) {
    const { name, parentId } = await prisma.directory.findUnique({
      where: { id: currentId },
      select: { name: true, parentId: true },
    });
    path.unshift(name);
    currentId = parentId;
  }
  return path.join("/");
};

module.exports = { getFullPath };
