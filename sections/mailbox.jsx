/* mailbox.jsx
   The Mailbox tab: writing a letter to each other, the two inboxes, unread
   markers, and opening old letters. Letters are permanent once sent. */

import { useState } from "react";
import { createPortal } from "react-dom";
import { IconEnvelope } from "../scene/doodles.jsx";
import { LetterUnfoldDemo } from "../scene/LetterUnfoldDemo.jsx";
import { uid } from "../store.jsx";

/* ===================== Mailbox ===================== */

import { LETTER_THEMES, THEME_ORDER } from "../scene/letterThemes.js";
export const emptyDraft = { to: "his", subject: "", body: "", signoff: "", theme: "rose" };

export function MailboxSection({ mail, saveInbox, draft, setDraft }) {
  const [composing, setComposing] = useState(false);
  const [activeBox, setActiveBox] = useState("hers");
  const [oldView, setOldView] = useState(false);
  const [revealLetter, setRevealLetter] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const inbox = mail[activeBox] || [];
  const unread = (box) => (mail[box] || []).filter((l) => !l.read).length;

  /* "read" moves a letter out of the main inbox into view old letters */
  const archiveLetter = async (letter) => {
    setBusy(true);
    setError("");
    try {
      const next = inbox.map((x) => (x.id === letter.id ? { ...x, archived: true } : x));
      await saveInbox(activeBox, next);
    } catch (e) {
      setError("Couldn't move that one just now, try again?");
    } finally {
      setBusy(false);
    }
  };

  /* clicking a letter opens the full reveal directly */
  const openLetter = async (letter) => {
    setRevealLetter(letter);
    if (!letter.read) {
      const next = inbox.map((l) => (l.id === letter.id ? { ...l, read: true } : l));
      try { await saveInbox(activeBox, next); } catch (e) { /* unread mark stays, harmless */ }
    }
  };

  const send = async () => {
    if (!draft.subject.trim()) { setError("What's the letter about? Add a short subject."); return; }
    if (!draft.body.trim()) { setError("The page is still blank. Write something first."); return; }
    if (!draft.signoff.trim()) { setError("Sign it off at the end, e.g. from bunny."); return; }
    setBusy(true);
    setError("");
    try {
      const letter = { id: uid(), subject: draft.subject.trim(), body: draft.body, signoff: draft.signoff.trim(), theme: draft.theme || "rose", sentAt: Date.now(), read: false };
      await saveInbox(draft.to, [...(mail[draft.to] || []), letter]);
      setDraft({ ...emptyDraft });
      setComposing(false);
    } catch (e) {
      setError("The letter didn't send. It's still here, try again?");
    } finally {
      setBusy(false);
    }
  };

  const stamp = (t) => new Date(t).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  const dateOnly = (t) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  const sortedInbox = [...inbox].sort((a, b) => b.sentAt - a.sentAt);
  const listLetters = sortedInbox.filter((l) => !l.archived);
  const oldLetters = sortedInbox.filter((l) => l.archived);

  if (composing) {
    return (
      <div className="panel pop-in" style={{ padding: 24, maxWidth: 620, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontWeight: 800 }}>Write something sweet</h2>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9a835d", textAlign: "right", marginBottom: 4 }}>letter colour</div>
            <div style={{ display: "flex", gap: 6 }}>
              {THEME_ORDER.map((key) => {
                const t = LETTER_THEMES[key];
                const active = (draft.theme || "rose") === key;
                return (
                  <button
                    key={key}
                    onClick={() => setDraft({ ...draft, theme: key })}
                    aria-label={t.label}
                    aria-pressed={active}
                    title={t.label}
                    style={{
                      width: 26, height: 26, borderRadius: "50%", padding: 0, cursor: "pointer",
                      background: t.swatch,
                      border: active ? "3px solid var(--brown)" : "2px solid rgba(139,111,71,.35)",
                      boxShadow: active ? "0 0 0 2px #fff, 0 2px 4px rgba(107,83,53,.3)" : "none",
                      transform: active ? "scale(1.08)" : "scale(1)",
                      transition: "transform .15s ease, box-shadow .15s ease",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#9a835d", margin: "0 0 16px" }}>
          {LETTER_THEMES[draft.theme || "rose"].label} — this can't be changed once the letter is sent.
        </p>
        <label style={{ fontWeight: 700, display: "block", marginBottom: 4 }}>To</label>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button className={`btn ${draft.to === "his" ? "btn-aqua" : "btn-plain"}`} onClick={() => setDraft({ ...draft, to: "his" })}>his inbox</button>
          <button className={`btn ${draft.to === "hers" ? "btn-pink" : "btn-plain"}`} onClick={() => setDraft({ ...draft, to: "hers" })}>her inbox</button>
        </div>
        <label style={{ fontWeight: 700, display: "block", marginBottom: 4 }}>Subject</label>
        <input className="field" value={draft.subject} placeholder="what this letter is about" onChange={(e) => setDraft({ ...draft, subject: e.target.value })} style={{ marginBottom: 12 }} />
        <label style={{ fontWeight: 700, display: "block", marginBottom: 4 }}>The letter</label>
        <textarea className="field hand" value={draft.body} placeholder="Dear you..." onChange={(e) => setDraft({ ...draft, body: e.target.value })} style={{ marginBottom: 12, minHeight: 170, fontSize: 22, lineHeight: 1.4 }} />
        <label style={{ fontWeight: 700, display: "block", marginBottom: 4 }}>Sign off</label>
        <input className="field hand" value={draft.signoff} placeholder="from ..." onChange={(e) => setDraft({ ...draft, signoff: e.target.value })} style={{ marginBottom: 12, fontSize: 22 }} />
        {error && <p style={{ color: "#c96a6a", marginTop: 0 }}>{error}</p>}
        <p style={{ fontSize: 13, color: "#9a835d", margin: "0 0 12px" }}>Letters are forever. Once sent there's no editing and no taking it back.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-pink" onClick={send} disabled={busy}>{busy ? "sending..." : "Send it with love"}</button>
          <button className="btn btn-plain" onClick={() => { setComposing(false); setError(""); }}>Back (draft is kept)</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 28 }}>The mailbox</h2>
        <button className="btn btn-green" onClick={() => setComposing(true)}>
          {draft.subject || draft.body || draft.signoff ? "Continue draft" : "Write a letter"}
        </button>
      </div>

      {/* inbox switcher */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        {["hers", "his"].map((box) => (
          <button
            key={box}
            className={`btn ${activeBox === box ? (box === "hers" ? "btn-pink" : "btn-aqua") : "btn-plain"}`}
            onClick={() => { setActiveBox(box); setRevealLetter(null); }}
            style={{ position: "relative" }}
          >
            {box === "hers" ? "her inbox" : "his inbox"}
            {unread(box) > 0 && (
              <span style={{ position: "absolute", top: -8, right: -8, background: "#e2696f", color: "#fff", borderRadius: 999, minWidth: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: "2px solid #fff", padding: "0 5px" }}>
                {unread(box)}
              </span>
            )}
          </button>
        ))}
        <button className={`btn ${oldView ? "btn-yellow" : "btn-plain"}`} onClick={() => { setOldView(!oldView); setRevealLetter(null); }} style={{ marginLeft: "auto" }}>
          {oldView ? "back to list" : "view old letters"}
        </button>
      </div>

      {error && <p style={{ color: "#c96a6a" }}>{error}</p>}

      {sortedInbox.length === 0 && (
        <div className="panel" style={{ padding: 28, textAlign: "center" }}>
          <IconEnvelope />
          <p style={{ margin: "8px 0 0" }}>No letters in here yet, chellakutty.</p>
        </div>
      )}

      {!oldView && sortedInbox.length > 0 && listLetters.length === 0 && (
        <div className="panel" style={{ padding: 24, textAlign: "center" }}>
          <p style={{ margin: 0 }}>All caught up, bby. The older ones are tucked away in view old letters.</p>
        </div>
      )}

      {oldView && sortedInbox.length > 0 && oldLetters.length === 0 && (
        <div className="panel" style={{ padding: 24, textAlign: "center" }}>
          <p style={{ margin: 0 }}>Nothing tucked away yet. Press read on a letter to move it here.</p>
        </div>
      )}

      {/* list view */}
      {!oldView && listLetters.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {listLetters.map((l) => (
            <div key={l.id} className="panel" style={{ padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => openLetter(l)}
                style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, textAlign: "left", fontFamily: "inherit", color: "inherit", fontSize: 16 }}
              >
                {!l.read && <span aria-label="unread" style={{ width: 12, height: 12, borderRadius: 999, background: "#e2696f", flexShrink: 0 }} />}
                <IconEnvelope />
                <span style={{ fontWeight: 700, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.subject}</span>
                <span style={{ fontSize: 13, color: "#9a835d", flexShrink: 0 }}>{stamp(l.sentAt)}</span>
              </button>
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 14px 12px" }}>
                <button
                  className="btn btn-yellow"
                  disabled={busy}
                  onClick={() => archiveLetter(l)}
                  aria-label={`Mark read and move to old letters: ${l.subject}`}
                  style={{ padding: "4px 16px", fontSize: 13 }}
                >
                  read
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* old letters view: closed envelopes */}
      {oldView && oldLetters.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center" }}>
          {oldLetters.map((l) => (
            <div key={l.id} style={{ width: 190 }}>
              <button
                onClick={() => openLetter(l)}
                aria-label={`Letter: ${l.subject}`}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, width: "100%", fontFamily: "inherit", color: "inherit" }}
              >
                <div style={{ position: "relative", background: "var(--paper)", border: "3px solid #d9c6a0", borderRadius: 10, height: 96, boxShadow: "0 4px 10px rgba(107,83,53,.14)" }}>
                  <svg viewBox="0 0 100 52" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
                    <path d="M2 4 L50 32 L98 4" fill="none" stroke="#d9c6a0" strokeWidth="3" strokeLinejoin="round" />
                  </svg>
                  {!l.read && <span aria-label="unread" style={{ position: "absolute", top: -7, right: -7, width: 16, height: 16, borderRadius: 999, background: "#e2696f", border: "2px solid #fff" }} />}
                  <span style={{ position: "absolute", right: 8, bottom: 6, width: 18, height: 22, background: "var(--purple)", borderRadius: 3, border: "2px solid #8b6f47", opacity: .85 }} />
                </div>
                <div style={{ marginTop: 6, fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>{l.subject}</div>
                <div style={{ fontSize: 12, color: "#9a835d", textAlign: "center" }}>{dateOnly(l.sentAt)}</div>
              </button>
            </div>
          ))}
        </div>
      )}

      {createPortal(
        <LetterUnfoldDemo letter={revealLetter} onClose={() => setRevealLetter(null)} />,
        document.body
      )}
    </div>
  );
}
