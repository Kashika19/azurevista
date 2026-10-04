const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:7071/api").replace(/\/$/, "");

async function parseResponse(response) {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof body === "object" && body?.error ? body.error : "Request failed";
    throw new Error(message);
  }
  return body;
}

export async function listMedia() {
  return parseResponse(await fetch(`${baseUrl}/media`));
}

export async function uploadMedia(file) {
  const form = new FormData();
  form.append("file", file);
  return parseResponse(await fetch(`${baseUrl}/media`, { method: "POST", body: form }));
}

export async function deleteMedia(id) {
  return parseResponse(await fetch(`${baseUrl}/media/${encodeURIComponent(id)}`, { method: "DELETE" }));
}

export function contentUrl(id) {
  return `${baseUrl}/media/${encodeURIComponent(id)}/content`;
}

