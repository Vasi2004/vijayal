/* timeline.jsx
   The Timeline tab: adding a memory, the confirm step, editing and deleting
   through "alter" mode, and the cards each memory appears on. */

import { useState, useRef } from "react";
import { FlowerDoodle, PencilIcon } from "../scene/doodles.jsx";
import { StoredPhoto, compressImage, photoCache, store, uid } from "../store.jsx";

/* ===================== Timeline / Calendar ===================== */

export const emptyEntryForm = { id: null, date: "", title: "", description: "", photos: [] };

// photos in form: [{ key: existingStoredKey }] or [{ data: freshDataURL }]

export function TimelineSection({ entries, saveEntries }) {
  const [mode, setMode] = useState("list"); // list | edit | preview
  const [form, setForm] = useState(emptyEntryForm);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteAsk, setDeleteAsk] = useState(null);
  const [alter, setAlter] = useState(false);
  const fileRef = useRef(null);

  const startNew = () => { setForm({ ...emptyEntryForm, photos: [] }); setFormError(""); setMode("edit"); };

  const deleteFromEdit = async () => {
    const orig = entries.find((e) => e.id === form.id);
    if (!orig) return;
    await doDelete(orig);
    setMode("list");
    setForm(emptyEntryForm);
  };
  const startEdit = (entry) => {
    setForm({ id: entry.id, date: entry.date, title: entry.title, description: entry.description, photos: (entry.photoKeys || []).map((k) => ({ key: k })) });
    setFormError("");
    setMode("edit");
  };

  const addPhotos = async (files) => {
    setFormError("");
    const list = Array.from(files || []);
    const room = 3 - form.photos.length;
    if (list.length > room) {
      setFormError(room === 0 ? "Three photos is the limit for one memory." : `Only room for ${room} more photo${room === 1 ? "" : "s"}.`);
      return;
    }
    try {
      const compressed = [];
      for (const f of list) compressed.push({ data: await compressImage(f) });
      setForm((p) => ({ ...p, photos: [...p.photos, ...compressed] }));
    } catch (e) {
      setFormError(e.message);
    }
  };

  const toPreview = () => {
    if (!form.date) { setFormError("Every memory needs a date."); return; }
    if (!form.title.trim()) { setFormError("Give this memory a little title."); return; }
    setFormError("");
    setMode("preview");
  };

  const confirmSave = async () => {
    setBusy(true);
    setFormError("");
    const newKeys = [];
    try {
      const photoKeys = [];
      for (const p of form.photos) {
        if (p.key) { photoKeys.push(p.key); continue; }
        const k = `tphoto:${uid()}`;
        await store.set(k, p.data);
        photoCache[k] = p.data;
        newKeys.push(k);
        photoKeys.push(k);
      }
      let next;
      if (form.id) {
        const old = entries.find((e) => e.id === form.id);
        const removed = old ? (old.photoKeys || []).filter((k) => !photoKeys.includes(k)) : [];
        next = entries.map((e) => e.id === form.id ? { ...e, date: form.date, title: form.title.trim(), description: form.description, photoKeys } : e);
        await saveEntries(next);
        for (const k of removed) { await store.del(k); delete photoCache[k]; }
      } else {
        next = [...entries, { id: uid(), date: form.date, title: form.title.trim(), description: form.description, photoKeys }];
        await saveEntries(next);
      }
      setMode("list");
      setForm(emptyEntryForm);
    } catch (e) {
      for (const k of newKeys) { await store.del(k); delete photoCache[k]; }
      setFormError("Saving didn't work, nothing was changed. Try again?");
      setMode("edit");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async (entry) => {
    setBusy(true);
    try {
      const next = entries.filter((e) => e.id !== entry.id);
      await saveEntries(next);
      for (const k of entry.photoKeys || []) { await store.del(k); delete photoCache[k]; }
      setDeleteAsk(null);
    } catch (e) {
      setFormError("Couldn't delete that one just now. Try again?");
    } finally {
      setBusy(false);
    }
  };

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const niceDate = (d) => {
    try {
      return new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return d; }
  };

  if (mode === "preview") {
    return (
      <div className="panel pop-in" style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ marginTop: 0, fontWeight: 800 }}>Does this look right, baby?</h2>
        <EntryCard entry={{ ...form, title: form.title.trim(), photoKeys: [] }} niceDate={niceDate} previewPhotos={form.photos} />
        {formError && <p style={{ color: "#c96a6a" }}>{formError}</p>}
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <button className="btn btn-green" onClick={confirmSave} disabled={busy}>{busy ? "saving..." : "Confirm and save"}</button>
          <button className="btn btn-plain" onClick={() => setMode("edit")} disabled={busy}>Cancel, keep editing</button>
        </div>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <div className="panel pop-in" style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ marginTop: 0, fontWeight: 800 }}>{form.id ? "Edit this memory" : "A new memory"}</h2>
        <label style={{ fontWeight: 700, display: "block", marginBottom: 4 }}>When was it?</label>
        <input className="field" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ marginBottom: 12 }} />
        <label style={{ fontWeight: 700, display: "block", marginBottom: 4 }}>Title</label>
        <input className="field" value={form.title} placeholder="e.g. first picnic in the park" onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 12 }} />
        <label style={{ fontWeight: 700, display: "block", marginBottom: 4 }}>What happened?</label>
        <textarea className="field" value={form.description} placeholder="Tell the story..." onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 12 }} />
        <label style={{ fontWeight: 700, display: "block", marginBottom: 4 }}>Photos ({form.photos.length}/3)</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          {form.photos.map((p, i) => (
            <div key={i} style={{ position: "relative" }}>
              {p.key
                ? <StoredPhoto pkey={p.key} style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 14, border: "3px solid #e2d3b3" }} />
                : <img src={p.data} alt="" style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 14, border: "3px solid #e2d3b3" }} />}
              <button
                aria-label="Remove photo"
                onClick={() => setForm((f) => ({ ...f, photos: f.photos.filter((_, j) => j !== i) }))}
                style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: 999, border: "2px solid #8b6f47", background: "#fff", cursor: "pointer", fontWeight: 800, lineHeight: 1 }}
              >x</button>
            </div>
          ))}
          {form.photos.length < 3 && (
            <button className="btn btn-plain" onClick={() => fileRef.current && fileRef.current.click()} style={{ width: 84, height: 84, borderRadius: 14, fontSize: 26 }}>+</button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
        </div>
        {formError && <p style={{ color: "#c96a6a", margin: "4px 0 10px" }}>{formError}</p>}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-yellow" onClick={toPreview}>Preview</button>
          <button
            type="button"
            className="btn btn-plain"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteAsk(null); setForm(emptyEntryForm); setMode("list"); }}
          >
            {"\u2190"} back to timeline
          </button>
          {form.id && (
            deleteAsk === form.id ? (
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 14 }}>Really let this one go?</span>
                <button className="btn btn-red" disabled={busy} onClick={deleteFromEdit} style={{ padding: "5px 14px", fontSize: 14 }}>{busy ? "deleting..." : "Yes, delete"}</button>
                <button className="btn btn-plain" disabled={busy} onClick={() => setDeleteAsk(null)} style={{ padding: "5px 14px", fontSize: 14 }}>Keep it</button>
              </span>
            ) : (
              <button className="btn btn-red" onClick={() => setDeleteAsk(form.id)} style={{ padding: "5px 16px", fontSize: 14 }}>Delete</button>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 28 }}>Our timeline</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-red" onClick={() => { setAlter((a) => !a); setDeleteAsk(null); }}>
            {alter ? "stop altering" : "alter"}
          </button>
          <button className="btn btn-green" onClick={startNew}>+ Add a memory</button>
        </div>
      </div>
      {sorted.length === 0 && (
        <div className="panel" style={{ padding: 28, textAlign: "center" }}>
          <FlowerDoodle petal="#f3a5b5" size={38} />
          <p style={{ margin: "8px 0 0" }}>Nothing here yet, kutty. Add our first memory and watch this garden grow.</p>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sorted.map((entry) => (
          <div key={entry.id} className="panel" style={{ padding: 20, position: "relative" }}>
            {alter && (
              <button
                className="btn btn-yellow"
                aria-label={`Edit memory: ${entry.title}`}
                onClick={() => startEdit(entry)}
                style={{ position: "absolute", top: 10, right: 10, width: 38, height: 38, padding: 0, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
              >
                <PencilIcon />
              </button>
            )}
            <EntryCard entry={entry} niceDate={niceDate} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EntryCard({ entry, niceDate, previewPhotos }) {
  return (
    <div>
      <div style={{ display: "inline-block", background: "var(--aqua)", color: "#144d45", borderRadius: 999, padding: "2px 14px", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        {entry.date ? niceDate(entry.date) : "no date"}
      </div>
      <h3 style={{ margin: "2px 0 6px", fontWeight: 800, fontSize: 22 }}>{entry.title || "(untitled)"}</h3>
      {entry.description && <p style={{ margin: "0 0 8px", whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{entry.description}</p>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {previewPhotos
          ? previewPhotos.map((p, i) => p.key
              ? <StoredPhoto key={i} pkey={p.key} style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 16, border: "3px solid #e2d3b3" }} />
              : <img key={i} src={p.data} alt="" style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 16, border: "3px solid #e2d3b3" }} />)
          : (entry.photoKeys || []).map((k) => (
              <StoredPhoto key={k} pkey={k} style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 16, border: "3px solid #e2d3b3" }} />
            ))}
      </div>
    </div>
  );
}
