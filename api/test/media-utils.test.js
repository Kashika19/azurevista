const test = require("node:test");
const assert = require("node:assert/strict");
const { createBlobName, mediaTypeFor, safeExtension, validateFile } = require("../src/lib/media-utils");

test("maps supported content types", () => {
  assert.equal(mediaTypeFor("image/png"), "image");
  assert.equal(mediaTypeFor("video/mp4"), "video");
  assert.equal(mediaTypeFor("audio/mpeg"), "audio");
  assert.equal(mediaTypeFor("application/pdf"), null);
});

test("keeps only safe short extensions", () => {
  assert.equal(safeExtension("photo.PNG"), ".png");
  assert.equal(safeExtension("payload.reallylongextension"), "");
  assert.equal(safeExtension("no-extension"), "");
});

test("creates opaque blob paths", () => {
  const blobName = createBlobName("holiday photo.jpg", "image");
  assert.match(blobName, /^image\/[0-9a-f-]+\.jpg$/);
  assert.equal(blobName.includes("holiday"), false);
});

test("validates type and size", () => {
  assert.match(validateFile(null, 100), /required/);
  assert.match(validateFile({ type: "application/pdf", size: 50 }, 100), /Unsupported/);
  assert.match(validateFile({ type: "image/png", size: 101 }, 100), /exceeds/);
  assert.equal(validateFile({ type: "image/png", size: 50 }, 100), null);
});

