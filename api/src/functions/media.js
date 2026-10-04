const { app } = require("@azure/functions");
const { randomUUID } = require("node:crypto");
const { getClients } = require("../lib/clients");
const { createBlobName, mediaTypeFor, validateFile } = require("../lib/media-utils");

function json(status, body) {
  return { status, jsonBody: body, headers: { "cache-control": "no-store" } };
}

function publicItem(record) {
  return {
    id: record.id,
    name: record.name,
    mediaType: record.mediaType,
    contentType: record.contentType,
    size: record.size,
    createdAt: record.createdAt,
  };
}

app.http("health", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "health",
  handler: async () => json(200, { status: "ok" }),
});

app.http("listMedia", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "media",
  handler: async (_request, context) => {
    try {
      const { media } = getClients();
      const query = "SELECT c.id, c.name, c.mediaType, c.contentType, c.size, c.createdAt FROM c ORDER BY c.createdAt DESC";
      const { resources } = await media.items.query(query).fetchAll();
      return json(200, { items: resources.map(publicItem) });
    } catch (error) {
      context.error("List media failed", error);
      return json(500, { error: "Media could not be loaded." });
    }
  },
});

app.http("uploadMedia", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "media",
  handler: async (request, context) => {
    let uploadedBlob;
    try {
      const { blobs, media, config } = getClients();
      const form = await request.formData();
      const file = form.get("file");
      const validationError = validateFile(file, config.maxUploadBytes);
      if (validationError) return json(400, { error: validationError });

      const mediaType = mediaTypeFor(file.type);
      const id = randomUUID();
      const blobName = createBlobName(file.name, mediaType);
      const blockBlob = blobs.getBlockBlobClient(blobName);
      const bytes = Buffer.from(await file.arrayBuffer());
      await blockBlob.uploadData(bytes, { blobHTTPHeaders: { blobContentType: file.type } });
      uploadedBlob = blockBlob;

      const record = {
        id,
        name: String(file.name).slice(0, 240),
        mediaType,
        contentType: file.type,
        size: file.size,
        blobName,
        createdAt: new Date().toISOString(),
      };
      await media.items.create(record);
      context.log("Media uploaded", { id, mediaType, size: file.size });
      return json(201, publicItem(record));
    } catch (error) {
      if (uploadedBlob) await uploadedBlob.deleteIfExists().catch(() => undefined);
      context.error("Upload media failed", error);
      return json(500, { error: "The upload could not be completed." });
    }
  },
});

app.http("getMediaContent", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "media/{id}/content",
  handler: async (request, context) => {
    try {
      const { blobs, media } = getClients();
      const id = request.params.id;
      const { resource } = await media.item(id, id).read();
      if (!resource) return json(404, { error: "Media item not found." });
      const download = await blobs.getBlobClient(resource.blobName).download();
      const chunks = [];
      for await (const chunk of download.readableStreamBody) chunks.push(chunk);
      return {
        status: 200,
        body: Buffer.concat(chunks),
        headers: {
          "content-type": resource.contentType,
          "content-length": String(resource.size),
          "cache-control": "private, max-age=300",
          "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(resource.name)}`,
        },
      };
    } catch (error) {
      if (error.code === 404) return json(404, { error: "Media item not found." });
      context.error("Get media content failed", error);
      return json(500, { error: "Media content could not be loaded." });
    }
  },
});

app.http("deleteMedia", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "media/{id}",
  handler: async (request, context) => {
    try {
      const { blobs, media } = getClients();
      const id = request.params.id;
      const item = media.item(id, id);
      const { resource } = await item.read();
      if (!resource) return json(404, { error: "Media item not found." });
      await blobs.getBlobClient(resource.blobName).deleteIfExists();
      await item.delete();
      context.log("Media deleted", { id });
      return { status: 204 };
    } catch (error) {
      if (error.code === 404) return json(404, { error: "Media item not found." });
      context.error("Delete media failed", error);
      return json(500, { error: "The media item could not be deleted." });
    }
  },
});
