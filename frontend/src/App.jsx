import { useEffect, useMemo, useState } from "react";
import { contentUrl, deleteMedia, listMedia, uploadMedia } from "./api.js";

const filters = ["all", "image", "video", "audio"];

function MediaPreview({ item }) {
  const url = contentUrl(item.id);
  if (item.mediaType === "image") return <img src={url} alt={item.name} loading="lazy" />;
  if (item.mediaType === "video") return <video src={url} controls preload="metadata" />;
  return <audio src={url} controls preload="metadata" />;
}

export default function App() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const visibleItems = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.mediaType === filter)),
    [filter, items],
  );

  async function refresh() {
    try {
      const result = await listMedia();
      setItems(result.items || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleUpload(event) {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      await uploadMedia(file);
      setFile(null);
      event.currentTarget.reset();
      await refresh();
      setMessage("Upload complete.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    setBusy(true);
    try {
      await deleteMedia(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setMessage("Media item deleted.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">Cloud multimedia library</p>
        <h1>AzureVista</h1>
        <p>Upload and manage images, video and audio through a serverless Azure application.</p>
      </header>

      <section className="upload-panel" aria-labelledby="upload-title">
        <div>
          <h2 id="upload-title">Add media</h2>
          <p>Accepted types: images, video and audio. Maximum size is controlled by the API.</p>
        </div>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            aria-label="Choose a media file"
          />
          <button type="submit" disabled={!file || busy}>{busy ? "Working..." : "Upload"}</button>
        </form>
      </section>

      {message && <p className="status" role="status">{message}</p>}

      <section aria-labelledby="library-title">
        <div className="library-heading">
          <div>
            <p className="eyebrow">Stored media</p>
            <h2 id="library-title">Library</h2>
          </div>
          <div className="filters" aria-label="Filter media">
            {filters.map((value) => (
              <button
                key={value}
                type="button"
                className={filter === value ? "selected" : ""}
                onClick={() => setFilter(value)}
              >
                {value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {visibleItems.length === 0 ? (
          <p className="empty">No media is available for this filter.</p>
        ) : (
          <div className="media-grid">
            {visibleItems.map((item) => (
              <article className="media-card" key={item.id}>
                <div className="preview"><MediaPreview item={item} /></div>
                <div className="card-content">
                  <h3>{item.name}</h3>
                  <p>{item.mediaType} · {(item.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p>{new Date(item.createdAt).toLocaleString()}</p>
                  <button type="button" className="danger" onClick={() => handleDelete(item)} disabled={busy}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

