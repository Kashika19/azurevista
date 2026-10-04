function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required setting: ${name}`);
  return value;
}

function getConfig() {
  return {
    storageAccountUrl: required("AZURE_STORAGE_ACCOUNT_URL"),
    storageContainer: process.env.AZURE_STORAGE_CONTAINER || "media",
    cosmosEndpoint: required("COSMOS_ENDPOINT"),
    cosmosDatabaseId: process.env.COSMOS_DATABASE_ID || "azurevista",
    cosmosContainerId: process.env.COSMOS_CONTAINER_ID || "media",
    maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024),
  };
}

module.exports = { getConfig };

