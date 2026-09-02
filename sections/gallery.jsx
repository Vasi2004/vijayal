/* gallery.jsx
   The Photobooth tab: the clothesline of photos, adding new ones, the zoom
   view, and "unpeg" mode for taking one down. */

import { useState, useRef } from "react";
import { BackArrow, Clothespin } from "../scene/doodles.jsx";
import { StoredPhoto, compressImage, photoCache, store, uid } from "../store.jsx";

/* ===================== Photobooth Gallery ===================== */

export function GallerySection({ sleeves, saveSleeves }) {
  const [openSleeve, setOpenSleeve] = useState(null);
  const [adding, setAdding] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [unpeg, setUnpeg] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [warnAdd, setWarnAdd] = useState(false);
  const [delBusy, setDelBusy] = useState(false);
  const [delError, setDelError] = useState("");
  const fileRef = useRef(null);

  const doUnpeg = async () => {
    const target = confirmDel && confirmDel.sleeve;
    if (!target) return;
    setDelBusy(true);
    setDelError("");
    try {
      const next = sleeves.filter((x) => x.id !== target.id);
      await saveSleeves(next);
      if (target.photoKey) { await store.del(target.photoKey); delete photoCache[target.photoKey]; }
      setConfirmDel(null);
    } catch (e) {
      setDelError("Couldn't unpeg it, try again?");
    } finally {
      setDelBusy(false);
    }
  };

  const pickFile = async (file) => {
    setError("");
    try {
      const data = await compressImage(file, 1200, 0.75);
      setPendingPhoto(data);
      setAdding(true);
    } catch (e) {
      setError(e.message);
    }
  };

  const saveNewSleeve = async () => {
    if (!pendingPhoto) return;
    setBusy(true);
    setError("");
    const key = `gphoto:${uid()}`;
    try {
      await store.set(key, pendingPhoto);
      photoCache[key] = pendingPhoto;
      const next = [...sleeves, { id: uid(), photoKey: key, caption: caption.trim(), uploadedAt: Date.now() }];
      await saveSleeves(next);
      setAdding(false);
      setPendingPhoto(null);
      setCaption("");
    } catch (e) {
      await store.del(key);
      delete photoCache[key];
      setError("The upload didn't stick, nothing was saved. Try again?");
    } finally {
      setBusy(false);
    }
  };

  const ordered = [...sleeves].sort((a, b) => a.uploadedAt - b.uploadedAt);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 28 }}>Photobooth</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn btn-red"
            onClick={() => { setUnpeg((u) => !u); setConfirmDel(null); }}
          >
            {unpeg ? "stop unpegging" : "unpeg a photo"}
          </button>
          <button
            className="btn btn-green"
            onClick={() => {
              if (unpeg) { setWarnAdd(true); return; }
              if (fileRef.current) fileRef.current.click();
            }}
          >
            + Peg up a photo
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { if (e.target.files && e.target.files[0]) pickFile(e.target.files[0]); e.target.value = ""; }} />
      </div>

      {error && !adding && <p style={{ color: "#c96a6a" }}>{error}</p>}

      {adding && (
        <div className="panel pop-in" style={{ padding: 20, marginBottom: 18, maxWidth: 460 }}>
          <h3 style={{ marginTop: 0, fontWeight: 800 }}>New sleeve</h3>
          <img src={pendingPhoto} alt="new upload" style={{ width: "100%", maxHeight: 260, objectFit: "contain", borderRadius: 14, background: "#f4ecdb", border: "3px solid #e2d3b3" }} />
          <input className="field" value={caption} placeholder="a little caption (optional)" onChange={(e) => setCaption(e.target.value)} style={{ margin: "12px 0" }} />
          {error && <p style={{ color: "#c96a6a", marginTop: 0 }}>{error}</p>}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-green" onClick={saveNewSleeve} disabled={busy}>{busy ? "pegging up..." : "Hang it up"}</button>
            <button className="btn btn-plain" disabled={busy} onClick={() => { setAdding(false); setPendingPhoto(null); setCaption(""); setError(""); }}>Never mind</button>
          </div>
        </div>
      )}

      {unpeg && ordered.length > 0 && (
        <p style={{ color: "#a14b4b", fontWeight: 700, margin: "0 0 10px" }}>Unpegging mode is on: tap a photo to take it down.</p>
      )}

      {ordered.length === 0 && !adding && (
        <div className="panel" style={{ padding: 28, textAlign: "center" }}>
          <p style={{ margin: 0 }}>The clothesline is empty, bby. Peg up our first photo!</p>
        </div>
      )}

      {confirmDel && (
        <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 70 }}>
          <div className="panel pop-in" style={{ padding: 22, width: "min(360px, 92vw)", textAlign: "center" }}>
            <p style={{ marginTop: 0, fontWeight: 800, fontSize: 20 }}>Unpeg this photo?</p>
            {confirmDel.sleeve.caption ? <p className="hand" style={{ fontSize: 21, margin: "0 0 8px" }}>{`"${confirmDel.sleeve.caption}"`}</p> : null}
            <p style={{ fontSize: 14, color: "#7a6647", marginTop: 0 }}>It comes off the clothesline for good.</p>
            {delError && <p style={{ color: "#c96a6a" }}>{delError}</p>}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-red" disabled={delBusy} onClick={doUnpeg}>{delBusy ? "unpegging..." : "unpeg it"}</button>
              <button className="btn btn-plain" disabled={delBusy} onClick={() => setConfirmDel(null)}>keep it</button>
            </div>
          </div>
        </div>
      )}

      {warnAdd && (
        <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 70 }}>
          <div className="panel pop-in" style={{ padding: 22, width: "min(340px, 92vw)", textAlign: "center" }}>
            <p style={{ margin: "0 0 14px", fontWeight: 800, fontSize: 19 }}>stop unpegging first kuttyma</p>
            <button className="btn btn-yellow" onClick={() => setWarnAdd(false)}>okie</button>
          </div>
        </div>
      )}

      {/* clothesline: rope lines repeat behind each row of fixed-height sleeves */}
      {ordered.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "40px 26px",
            justifyContent: "center",
            padding: "14px 6px 30px",
            backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 24px, #8b6f47 24px, #8b6f47 27px, transparent 27px, transparent 290px)",
          }}
        >
          {ordered.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { if (unpeg) { setConfirmDel({ sleeve: s }); setDelError(""); } else setOpenSleeve(s); }}
              aria-label={unpeg ? `Unpeg photo${s.caption ? ": " + s.caption : ""}` : `Open photo${s.caption ? ": " + s.caption : ""}`}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                height: 250,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "inherit",
                color: "inherit",
                transform: `rotate(${[-2.5, 1.5, -1, 2.2, -1.8, 0.8][i % 6]}deg)`,
                transformOrigin: "top center",
              }}
            >
              <Clothespin />
              <div style={{ background: "var(--paper)", border: "3px solid #e2d3b3", borderRadius: 10, padding: "8px 8px 10px", boxShadow: "0 6px 14px rgba(107,83,53,.18)", marginTop: -4 }}>
                <StoredPhoto pkey={s.photoKey} alt={s.caption} style={{ width: 140, height: 150, objectFit: "cover", borderRadius: 6, display: "block" }} />
                <div className="hand" style={{ fontSize: 19, marginTop: 6, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minHeight: 22 }}>
                  {s.caption || "\u00a0"}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* lightbox */}
      {openSleeve && (
        <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(52, 42, 27, .78)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <button
            onClick={() => setOpenSleeve(null)}
            aria-label="Close photo"
            className="pop-in"
            style={{ position: "absolute", top: 18, left: 18, width: 48, height: 48, borderRadius: 999, background: "var(--cream)", border: "3px solid var(--brown)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <BackArrow />
          </button>
          <div className="pop-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "100%" }}>
            <StoredPhoto pkey={openSleeve.photoKey} alt={openSleeve.caption} style={{ maxWidth: "92vw", maxHeight: "78vh", width: "auto", height: "auto", objectFit: "contain", borderRadius: 12, border: "6px solid #fffdf6" }} />
            {openSleeve.caption && <div className="hand" style={{ color: "#fff6e0", fontSize: 28, marginTop: 12, textAlign: "center" }}>{openSleeve.caption}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
