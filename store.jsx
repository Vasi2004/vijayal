/* store.jsx
   Saving and loading. `store` reads and writes the shared data (timeline,
   gallery, letters, about) so both of you see the same thing, and also the
   per-device day/night preference. Also handles shrinking photos before they
   are saved, and showing a saved photo once it loads. */

import { useState, useEffect } from "react";

export const store = {
  async get(key) {
    try {
      const r = await window.storage.get(key, true);
      return r ? JSON.parse(r.value) : null;
    } catch (e) {
      return null; // missing key
    }
  },
  async set(key, value) {
    const r = await window.storage.set(key, JSON.stringify(value), true);
    if (!r) throw new Error("save failed");
  },
  async del(key) {
    try { await window.storage.delete(key, true); } catch (e) { /* fine */ }
  },
  /* personal (per user) storage, used for the day/night preference */
  async getPersonal(key) {
    try {
      const r = await window.storage.get(key, false);
      return r ? JSON.parse(r.value) : null;
    } catch (e) {
      return null;
    }
  },
  async setPersonal(key, value) {
    try { await window.storage.set(key, JSON.stringify(value), false); } catch (e) { /* non critical */ }
  },
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* ---------- image compression (jpg/png/webp in, small jpeg out) ---------- */

export function compressImage(file, maxDim = 1000, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) {
      reject(new Error("That file type won't fit in the album. jpg, png or webp please."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file. Try again?"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That image wouldn't open. Try another?"));
      img.onload = () => {
        try {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch (e) {
          reject(new Error("Something went wrong while resizing. Try again?"));
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- stored photo loader with a tiny cache ---------- */

export const photoCache = {};

export function StoredPhoto({ pkey, alt, className, style }) {
  const [src, setSrc] = useState(photoCache[pkey] || null);
  useEffect(() => {
    let live = true;
    if (!photoCache[pkey]) {
      store.get(pkey).then((v) => {
        if (live && v) { photoCache[pkey] = v; setSrc(v); }
      });
    } else {
      setSrc(photoCache[pkey]);
    }
    return () => { live = false; };
  }, [pkey]);
  if (!src) {
    return (
      <div className={className} style={{ ...style, background: "#efe6d2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#a08a63" }}>
        loading...
      </div>
    );
  }
  return <img src={src} alt={alt || ""} className={className} style={style} />;
}
