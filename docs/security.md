# Security review

## Controls included

- Azure SDK clients use `DefaultAzureCredential`.
- The frontend contains only the API base URL.
- Storage objects use opaque generated names.
- The server checks MIME type and file size.
- Error responses avoid returning stack traces or Azure identifiers.
- Blob Storage remains private and content is streamed after an API lookup.
- Local settings, environment files, keys and state files are ignored by Git.

## Controls required before production

The HTTP routes use anonymous access so the project can run locally without a user identity provider. A deployed version must place Microsoft Entra authentication, Static Web Apps authentication or an API gateway policy in front of these routes. Add ownership fields to Cosmos records and enforce them for list, read and delete operations.

MIME checks do not prove file safety. Add malware scanning, content-disposition controls, throttling, quotas and abuse monitoring. Consider short-lived user-delegation SAS URLs for large downloads after authorisation.

## Secret handling

Never place storage keys, Cosmos keys, SAS tokens or Function keys in a `VITE_` variable. Vite embeds those values into browser-delivered JavaScript.

