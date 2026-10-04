const { DefaultAzureCredential } = require("@azure/identity");
const { BlobServiceClient } = require("@azure/storage-blob");
const { CosmosClient } = require("@azure/cosmos");
const { getConfig } = require("./config");

let cached;

function getClients() {
  if (cached) return cached;
  const config = getConfig();
  const credential = new DefaultAzureCredential();
  const blobService = new BlobServiceClient(config.storageAccountUrl, credential);
  const cosmos = new CosmosClient({ endpoint: config.cosmosEndpoint, aadCredentials: credential });

  cached = {
    config,
    blobs: blobService.getContainerClient(config.storageContainer),
    media: cosmos.database(config.cosmosDatabaseId).container(config.cosmosContainerId),
  };
  return cached;
}

module.exports = { getClients };

