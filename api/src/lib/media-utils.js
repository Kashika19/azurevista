const path = require("node:path");
const { randomUUID } = require("node:crypto");

const supportedTypes = {
  image: new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]),
  video: new Set(["video/mp4", "video/webm"]),
  audio: new Set(["audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav"]),
};

function mediaTypeFor(contentType) {
  return Object.entries(supportedTypes).find(([, values]) => values.has(contentType))?.[0] || null;
}

function safeExtension(fileName) {
  const extension = path.extname(fileName || "").toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(extension) ? extension : "";
}

function createBlobName(fileName, mediaType) {
  return `${mediaType}/${randomUUID()}${safeExtension(fileName)}`;
}

function validateFile(file, maxBytes) {
  if (!file) return "A multipart field named 'file' is required.";
  const mediaType = mediaTypeFor(file.type);
  if (!mediaType) return "Unsupported media type.";
  if (!Number.isFinite(file.size) || file.size <= 0) return "The file is empty.";
  if (file.size > maxBytes) return `The file exceeds the ${maxBytes}-byte upload limit.`;
  return null;
}

module.exports = { createBlobName, mediaTypeFor, safeExtension, validateFile };

