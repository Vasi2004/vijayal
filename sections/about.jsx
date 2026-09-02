/* about.jsx
   The Us tab: the About Me and About Her cards, their prefilled details, and
   editing them. */

import { useState, useRef } from "react";
import { HeartShape, PencilIcon } from "../scene/doodles.jsx";
import { StoredPhoto, compressImage, photoCache, store, uid } from "../store.jsx";

/* ===================== About Me / About Her ===================== */

export const ABOUT_FIELDS = [
  { key: "bio", label: "Bio", prompt: "A little about them... personality, love languages, anything at all" },
  { key: "likes", label: "Likes", prompt: "Favourite foods, movies, music, little joys..." },
  { key: "dislikes", label: "Dislikes", prompt: "Things to steer around..." },
  { key: "wants", label: "Wants", prompt: "Wishes, dreams, things to do together..." },
];

export const HER_DEFAULT = {
  bio:
    "Personality: family oriented, thrill seeking, funny, loves princess treatment, Tamil cultured, strong sense of humour (yapping)\n" +
    "Love languages: words of affirmation, touch, quality time, acts of service, gifts\n" +
    "Colours: aqua and purple\n" +
    "Style: short kurtis, gold and silver earrings",
  likes:
    "Favourites: a\u00e7ai with pistachio, matcha, NY cheesecake, pesto pasta, meatlovers pizza, Oporto burgers, chilli cheese loaded fries, maxibon (cookies & cream, original), strawberries, hot chocolate, pineapple, Starbucks strawberry lemonade soda\n" +
    "Movies: Gilli, Padayappa, Pokkiri, Aadhavan, Mahalakshmi and similar\n" +
    "Music: Anirudh, AR Rahman, Harris Jayaraj, hip hop, Vidyasagar\n" +
    "Favourite song: Yaakai Thiri\n" +
    "Interests: Italy (travel, food), matcha culture, picnics over hikes",
  dislikes: "grilled or fried chicken, most vegetables except potato and lettuce, seafood, lasagne",
  wants: "",
  unconfirmed: {},
  photoKey: "",
  name: "Vijayal",
};

export const ME_DEFAULT = { name: "Vasi", bio: "", likes: "", dislikes: "", wants: "", unconfirmed: {}, photoKey: "" };

export function AboutCard({ defaultName, data, onSave }) {
  const title = `About ${(data.name || defaultName).trim() || defaultName}`;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const picRef = useRef(null);

  const startEdit = () => {
    setDraft({ name: data.name || defaultName, bio: data.bio, likes: data.likes, dislikes: data.dislikes, wants: data.wants, newPhoto: null });
    setError("");
    setEditing(true);
  };

  const pickPic = async (file) => {
    setError("");
    try {
      const d = await compressImage(file, 400, 0.8);
      setDraft((dr) => ({ ...dr, newPhoto: d }));
    } catch (e) {
      setError(e.message);
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError("");
    let newKey = "";
    try {
      const unconfirmed = { ...(data.unconfirmed || {}) };
      for (const f of ABOUT_FIELDS) {
        if (unconfirmed[f.key] && draft[f.key] !== data[f.key]) delete unconfirmed[f.key];
      }
      let photoKey = data.photoKey || "";
      if (draft.newPhoto) {
        newKey = `aphoto:${uid()}`;
        await store.set(newKey, draft.newPhoto);
        photoCache[newKey] = draft.newPhoto;
        photoKey = newKey;
      }
      const { newPhoto, ...fields } = draft;
      if (!fields.name || !fields.name.trim()) fields.name = defaultName;
      await onSave({ ...data, ...fields, unconfirmed, photoKey });
      if (newKey && data.photoKey) { await store.del(data.photoKey); delete photoCache[data.photoKey]; }
      setEditing(false);
      setDraft(null);
    } catch (e) {
      if (newKey) { await store.del(newKey); delete photoCache[newKey]; }
      setError("Saving didn't work. Your edits are still here, try again?");
    } finally {
      setBusy(false);
    }
  };

  const avatarSrc = editing && draft && draft.newPhoto ? draft.newPhoto : null;

  return (
    <div className="panel" style={{ padding: 22, flex: "1 1 320px", minWidth: 0 }}>
      <div style={{ position: "relative", marginBottom: 16 }}>
        {!editing && (
          <button
            className="btn btn-yellow"
            aria-label={`Edit ${title}`}
            onClick={startEdit}
            style={{ position: "absolute", top: 0, right: 0, width: 42, height: 42, padding: 0, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <PencilIcon />
          </button>
        )}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 148, height: 148, borderRadius: "50%", overflow: "hidden", border: "4px solid #e8cfc0", background: "#fdf3e3", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(239,147,174,.3), 0 4px 12px rgba(107,83,53,.15)" }}>
            {avatarSrc
              ? <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              : data.photoKey
                ? <StoredPhoto pkey={data.photoKey} alt={`${title} photo`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <HeartShape size={56} fill="#f3a5b5" opacity={0.7} />}
          </div>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 24, textAlign: "center" }}>{title}</h3>
        </div>
      </div>

      {!editing && ABOUT_FIELDS.map((f) => {
        const val = data[f.key];

        return (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              {f.label}

            </div>
            {val
              ? <p style={{ margin: "4px 0 0", whiteSpace: "pre-wrap", lineHeight: 1.55, }}>{val}</p>
              : <p style={{ margin: "4px 0 0", color: "#b3a07d", fontStyle: "italic", }}>{f.prompt}</p>}
          </div>
        );
      })}

      {editing && draft && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 800, display: "block", marginBottom: 4 }}>Name</label>
            <input
              className="field"
              value={draft.name}
              placeholder={defaultName}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 800, display: "block", marginBottom: 4 }}>Profile picture</label>
            <input ref={picRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { if (e.target.files && e.target.files[0]) pickPic(e.target.files[0]); e.target.value = ""; }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-plain" onClick={() => picRef.current && picRef.current.click()} style={{ padding: "5px 14px", fontSize: 14 }}>
                {draft.newPhoto || data.photoKey ? "Change photo" : "Add a photo"}
              </button>
              {draft.newPhoto && <span style={{ fontSize: 14, color: "#7a6647" }}>new photo ready, hit Confirm to keep it</span>}
            </div>
          </div>
          {ABOUT_FIELDS.map((f) => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 800, display: "block", marginBottom: 4 }}>{f.label}</label>
              <textarea
                className="field"
                value={draft[f.key]}
                placeholder={f.prompt}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
              />
            </div>
          ))}
          {error && <p style={{ color: "#c96a6a" }}>{error}</p>}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-green" onClick={confirm} disabled={busy}>{busy ? "saving..." : "Confirm"}</button>
            <button className="btn btn-plain" disabled={busy} onClick={() => { setEditing(false); setDraft(null); setError(""); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AboutSection({ aboutMe, aboutHer, saveAbout }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ margin: "0 0 16px", fontWeight: 800, fontSize: 28 }}>The two of us</h2>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <AboutCard defaultName="Vasi" data={aboutMe} onSave={(d) => saveAbout("me", d)} />
        <AboutCard defaultName="Vijayal" data={aboutHer} onSave={(d) => saveAbout("her", d)} />
      </div>
    </div>
  );
}
