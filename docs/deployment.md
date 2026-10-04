# Deployment guide

This repository does not contain live Azure resource names or credentials. Create resources in an authorised subscription and keep configuration in the Function App settings.

## Required resources

1. Storage account with a private `media` Blob container
2. Cosmos DB for NoSQL account with an `azurevista` database and `media` container
3. Function App using Azure Functions runtime 4 and a supported Node.js version
4. Application Insights resource connected to the Function App
5. Static Web App or another HTTPS host for the frontend

Use `/id` as the Cosmos DB partition key because the API reads and deletes records by ID.

## Identity and access

Enable the Function App system-assigned managed identity, then grant only the data-plane roles it needs:

- Storage Blob Data Contributor on the media storage scope
- Cosmos DB Built-in Data Contributor on the database account or a narrower scope

Set these Function App configuration values:

```text
AZURE_STORAGE_ACCOUNT_URL=https://<account>.blob.core.windows.net
AZURE_STORAGE_CONTAINER=media
COSMOS_ENDPOINT=https://<account>.documents.azure.com:443/
COSMOS_DATABASE_ID=azurevista
COSMOS_CONTAINER_ID=media
MAX_UPLOAD_BYTES=10485760
```

Configure the frontend `VITE_API_BASE_URL` with the deployed API address during its build.

## Production gate

Before allowing public uploads:

- Enable Microsoft Entra authentication or an equivalent identity layer
- Restrict CORS to the deployed frontend origin
- Add per-user authorisation and ownership checks
- Add malware scanning and retention rules
- Configure Azure Monitor alerts for failures, latency and unusual request volume
- Review consumption limits and set a budget alert

