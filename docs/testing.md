# Testing approach

## Automated checks

Run API unit tests with:

```text
cd api
npm test
```

The tests cover media-type mapping, filename sanitisation, opaque blob-name generation and upload validation.

Build the frontend with:

```text
cd frontend
npm run build
```

## Integration scenarios

| Scenario | Expected result |
|---|---|
| Upload a supported image below the size limit | Blob and metadata record are created |
| Upload an unsupported document | API returns 400 without creating a blob |
| Upload a file above the configured limit | API returns 400 |
| List media | Results are ordered newest first and exclude storage paths |
| Read unknown ID | API returns 404 |
| Delete existing item | Blob and Cosmos record are removed |
| Cosmos write fails after blob upload | API attempts to remove the orphaned blob |

## Operational checks

After deployment, confirm Application Insights receives request, dependency and error telemetry. Create Azure Monitor alerts for repeated server errors and elevated response time. Do not log file contents, credentials or personal data.

