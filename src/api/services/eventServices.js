const path = require("path");
const { Worker } = require("worker_threads");

const sanitizeFileName = (fileName) => {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const generateS3Key = (userId, eventId, fileType, originalName) => {
  const timestamp = Date.now();
  const sanitizedName = sanitizeFileName(originalName.split(".")[0]);

  return `${userId}/${eventId}/${fileType}/${timestamp}-${sanitizedName}.webp`;
};

const processImage = (buffer, type) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.join(__dirname, "..", "workers", "eventWorkers.js")
    );

    worker.postMessage({ buffer, type });

    worker.on("message", (result) => {
      worker.terminate();
      if (result.success) {
        resolve(result.buffer);
      } else {
        reject(new Error(result.error));
      }
    });

    worker.on("error", (error) => {
      worker.terminate();
      reject(error);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code: ${code}`));
      }
    });
  });
};

module.exports = { sanitizeFileName, generateS3Key, processImage };
