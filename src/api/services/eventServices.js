const crypto = require("crypto");

const sanitizeFileName = (fileName) => {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const generateS3Key = (userId, fileType, originalName) => {
  const timestamp = Date.now();
  const sanitizedName = sanitizeFileName(originalName.split(".")[0]);

  return `${userId}/${fileType}/${timestamp}-${sanitizedName}.webp`;
};

module.exports = { sanitizeFileName, generateS3Key };
