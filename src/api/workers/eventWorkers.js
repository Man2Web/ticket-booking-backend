const sharp = require("sharp");
const { parentPort, workerData } = require("worker_threads");

async function processImage(buffer, type) {
  try {
    const quality = 80;
    switch (type) {
      case "banner":
        return await sharp(buffer)
          .resize(1920, 1080, { fit: "cover" })
          .webp({ quality })
          .toBuffer();
      case "main":
        return await sharp(buffer)
          .resize(800, 600, { fit: "cover" })
          .webp({ quality })
          .toBuffer();
      case "gallery":
        return await sharp(buffer)
          .resize(400, 300, { fit: "cover" })
          .webp({ quality })
          .toBuffer();
      default:
        throw new Error("Invalid Image Type");
    }
  } catch (error) {
    throw new Error(`Image processing failed: ${error.messsage}`);
  }
}

parentPort.on("message", async (data) => {
  try {
    const { buffer, type } = data;
    const processedBuffer = await processImage(buffer, type);
    parentPort.postMessage({ success: true, buffer: processedBuffer });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});
