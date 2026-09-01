/* App.jsx
   The top level: holds the login state, the four tabs, and loads the saved
   data when you come in. Small on purpose; the actual sections live in
   timeline.jsx, gallery.jsx, mailbox.jsx and about.jsx. */

import { useState, useEffect } from "react";
import { AboutSection, HER_DEFAULT, ME_DEFAULT } from "./sections/about.jsx";
import { PhotoCarousel } from "./scene/carousel.jsx";
import { DayNightToggle, FlowerDoodle, IconCamera, IconEnvelope, IconHearts, IconTimeline } from "./scene/doodles.jsx";
import { GallerySection } from "./sections/gallery.jsx";
import { LoginGate } from "./sections/login.jsx";
import { MailboxSection, emptyDraft } from "./sections/mailbox.jsx";
import { MusicWidget } from "./music.jsx";
import { AmbientBackground } from "./scene/scene.jsx";
import { store } from "./store.jsx";
import { GlobalStyles } from "./styles.jsx";
import { TimelineSection } from "./sections/timeline.jsx";
import { useGsapAmbient } from "./scene/weather.jsx";

/* ===================== App shell ===================== */

export const TABS = [
  { id: "timeline", label: "Timeline", icon: <IconTimeline /> },
  { id: "gallery", label: "Photobooth", icon: <IconCamera /> },
  { id: "mailbox", label: "Mailbox", icon: <IconEnvelope /> },
  { id: "about", label: "Us", icon: <IconHearts /> },
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState("timeline");
  /* always opens in day mode; night only via the manual toggle */
  const [theme, setTheme] = useState("day");
  const [confirmExit, setConfirmExit] = useState(false);
  const [gsapReady, setGsapReady] = useState(false);

  /* load GSAP from CDN; CSS animations remain the fallback if it fails */
  useEffect(() => {
    if (window.gsap) { setGsapReady(true); return; }
    const sc = document.createElement("script");
    sc.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    sc.onload = () => setGsapReady(true);
    document.head.appendChild(sc);
  }, []);

  useGsapAmbient(gsapReady, [theme, loggedIn]);

  const [entries, setEntries] = useState([]);
  const [sleeves, setSleeves] = useState([]);
  const [mail, setMail] = useState({ his: [], hers: [] });
  const [aboutMe, setAboutMe] = useState(ME_DEFAULT);
  const [aboutHer, setAboutHer] = useState(HER_DEFAULT);
  const [mailDraft, setMailDraft] = useState({ ...emptyDraft }); // session-only autosaved draft

  const loadAll = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [e, s, mHis, mHers, aMe, aHer] = await Promise.all([
        store.get("timeline-entries"),
        store.get("gallery-sleeves"),
        store.get("mailbox-his"),
        store.get("mailbox-hers"),
        store.get("about-me"),
        store.get("about-her"),
      ]);
      setEntries(e || []);
      setSleeves(s || []);
      setMail({ his: mHis || [], hers: mHers || [] });
      setAboutMe(aMe || ME_DEFAULT);
      setAboutHer(aHer || HER_DEFAULT);
    } catch (err) {
      setLoadError("Couldn't fetch everything just now.");
    } finally {
      setLoading(false);
    }
  };

  const onLogin = () => { setLoggedIn(true); loadAll(); };

  /* persist helpers: save to storage first, then update state (last save wins) */
  const saveEntries = async (next) => { await store.set("timeline-entries", next); setEntries(next); };
  const saveSleeves = async (next) => { await store.set("gallery-sleeves", next); setSleeves(next); };
  const saveInbox = async (box, next) => {
    await store.set(box === "his" ? "mailbox-his" : "mailbox-hers", next);
    setMail((m) => ({ ...m, [box]: next }));
  };
  const saveAbout = async (who, next) => {
    await store.set(who === "me" ? "about-me" : "about-her", next);
    if (who === "me") setAboutMe(next); else setAboutHer(next);
  };

  const totalUnread = (mail.his || []).filter((l) => !l.read).length + (mail.hers || []).filter((l) => !l.read).length;

  return (
    <div className="us-root" style={{ minHeight: "100vh", position: "relative" }}>
      <GlobalStyles />
      <AmbientBackground theme={theme} active={loggedIn} />
      <DayNightToggle theme={theme} setTheme={setTheme} />
      {loggedIn && <MusicWidget gsapReady={gsapReady} />}
      {loggedIn && <PhotoCarousel sleeves={sleeves} />}
      {loggedIn && (
        <button
          className="btn btn-plain"
          onClick={() => setConfirmExit(true)}
          style={{ position: "fixed", top: 14, right: 14, zIndex: 30, padding: "8px 16px", fontSize: 14 }}
        >
          save & exit
        </button>
      )}
      {loggedIn && confirmExit && (
        <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 80 }}>
          <div className="panel pop-in" style={{ position: "relative", padding: "54px 26px 24px", width: "min(360px, 92vw)", textAlign: "center" }}>
            <button
              onClick={() => setConfirmExit(false)}
              aria-label="Stay, close this popup"
              className="btn btn-plain"
              style={{ position: "absolute", top: 10, left: 10, width: 40, height: 40, borderRadius: "50%", padding: 0, fontSize: 18, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {"\u2190"}
            </button>
            <p style={{ marginTop: 0, fontWeight: 800, fontSize: 20 }}>Leaving already, kutty?</p>
            <p style={{ fontSize: 14, color: "#7a6647", margin: "0 0 16px" }}>Everything's saved, your draft included. The door's open whenever you come back.</p>
            <button
              className="btn btn-red"
              onClick={() => { setConfirmExit(false); setLoggedIn(false); }}
            >
              {"bye bbyy <3"}
            </button>
          </div>
        </div>
      )}

      {!loggedIn ? (
        <LoginGate onSuccess={onLogin} />
      ) : (
        <div style={{ position: "relative", zIndex: 1, maxWidth: 980, margin: "0 auto", padding: "20px 14px 150px", pointerEvents: "none" }}>
        <div className="content-frame">
          {/* header + tabs */}
          <header style={{ textAlign: "center", marginBottom: 18 }}>
            <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, textShadow: "0 2px 0 rgba(255,255,255,.45)" }}>Vasi & Vijayal's Kutty House</h1>
            <p className="hand" style={{ margin: "2px 0 0", fontSize: 22, opacity: .85 }}>our kutty little corner</p>
            <nav aria-label="Sections" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 10 }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`btn ${tab === t.id ? "btn-aqua" : "btn-plain"}`}
                  onClick={() => setTab(t.id)}
                  style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  {t.icon}
                  {t.label}
                  {t.id === "mailbox" && totalUnread > 0 && (
                    <span aria-label={`${totalUnread} unread letters`} style={{ position: "absolute", top: -9, right: -9, background: "#e2696f", color: "#fff", borderRadius: 999, minWidth: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: "2px solid #fff", padding: "0 5px" }}>
                      {totalUnread}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </header>

          {loadError && (
            <div className="panel" style={{ padding: 16, marginBottom: 16, textAlign: "center", color: "#c96a6a" }}>
              {loadError} <button className="btn btn-plain" onClick={loadAll} style={{ marginLeft: 8, padding: "4px 14px", fontSize: 14 }}>Retry</button>
            </div>
          )}

          {loading ? (
            <div className="panel" style={{ padding: 30, textAlign: "center" }}>
              <FlowerDoodle petal="#b39ddb" />
              <p style={{ margin: "8px 0 0" }}>opening the kutty house...</p>
            </div>
          ) : (
            <main>
              {tab === "timeline" && <TimelineSection entries={entries} saveEntries={saveEntries} />}
              {tab === "gallery" && <GallerySection sleeves={sleeves} saveSleeves={saveSleeves} />}
              {tab === "mailbox" && <MailboxSection mail={mail} saveInbox={saveInbox} draft={mailDraft} setDraft={setMailDraft} />}
              {tab === "about" && <AboutSection aboutMe={aboutMe} aboutHer={aboutHer} saveAbout={saveAbout} />}
            </main>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
