/* music.jsx
   The CD player: the playlist, the spinning disc, the song name, and the
   previous / play / next buttons.
   Add or change songs in the PLAYLIST at the top of this file. */

import { useState, useEffect, useRef } from "react";
import { prefersReducedMotion } from "./gsap.js";

export const PLAYLIST = [
  { title: "Adada Mazhaida", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Adada-Mazhaida.mp3" },
  { title: "Dippam Dappam", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Dippam-Dappam-MassTamilan.so.mp3" },
  { title: "Entammede Jimikki Kammal", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Entammede%20Jimikki%20Kammal.mp3" },
  { title: "Katchi Sera", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Katchi%20Sera.mp3" },
  { title: "Kuchi Mittai", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Kuchi%20Mittai.mp3" },
  { title: "Monica", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Monica.mp3" },
  { title: "Oru Maalai", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Oru-Maalai.mp3" },
  { title: "Pavazha Malli", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Pavazha%20Malli.mp3" },
  { title: "Radhimaa", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Radhimaa.mp3" },
  { title: "Rowdy Baby", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Rowdy-Baby-MassTamilan.org.mp3" },
  { title: "Senjitaley", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Senjitaley.mp3" },
  { title: "Thangame", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Thangame.mp3" },
  { title: "Yakkai Thiri", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/Yakkai-Thiri.mp3" },
  { title: "Kalyani", src: "https://aqhkecknthcdpailpcst.supabase.co/storage/v1/object/public/music/ytmp3free.cc_kalyani-with-shreya-ghoshal-official-music-video-arjn-kds-fifty4-ronn-shreya-ghoshal-youtubemp3free.org.mp3" },
];

export function MusicWidget({ gsapReady }) {
  const tracks = PLAYLIST.filter((t) => t.src);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  const audioRef = useRef(null);
  const discRef = useRef(null);
  const wantPlay = useRef(false);
  const [curTime, setCurTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const barRef = useRef(null);
  const current = tracks[idx];

  /* each song gives the disc its own pair of colours */
  const DISC_COLOURS = [
    ["#f3a5b5", "#8fd8cf"], ["#f7c66b", "#a8c8f0"], ["#c9a4e4", "#8fd8a0"],
    ["#ef8fb3", "#f7d566"], ["#7fc4e8", "#f3a5b5"], ["#9ad6a0", "#e4a4d8"],
    ["#f0a6d0", "#8fd8cf"], ["#e8b06b", "#9fb8ef"],
  ];
  const disc = DISC_COLOURS[idx % DISC_COLOURS.length];

  useEffect(() => {
    const el = discRef.current;
    if (!el || !playing || !window.gsap || prefersReducedMotion()) return;
    const tw = window.gsap.to(el, { rotation: "+=360", duration: 4, ease: "none", repeat: -1 });
    return () => tw.kill();
  }, [playing, gsapReady]);

  /* keep playing straight through when the track changes */
  useEffect(() => {
    setCurTime(0);
    setDuration(0);
  }, [idx]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current || !wantPlay.current) return;
    a.play().catch(() => setPlaying(false));
  }, [idx]);

  const seekFromEvent = (e) => {
    const el = barRef.current;
    const a = audioRef.current;
    if (!el || !a || !duration) return;
    const rect = el.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return frac * duration;
  };
  const startScrub = (e) => {
    const t = seekFromEvent(e);
    if (t === undefined) return;
    setScrubbing(true);
    setScrubTime(t);
    const move = (ev) => {
      const nt = seekFromEvent(ev);
      if (nt !== undefined) setScrubTime(nt);
    };
    const end = (ev) => {
      const nt = seekFromEvent(ev);
      if (nt !== undefined && audioRef.current) {
        audioRef.current.currentTime = nt;
        setCurTime(nt);
      }
      setScrubbing(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", end);
  };
  const fmtTime = (s) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  };

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !current) return;
    if (playing) { wantPlay.current = false; a.pause(); }
    else { wantPlay.current = true; a.play().catch(() => setPlaying(false)); }
  };
  const step = (dir) => {
    if (tracks.length < 2) return;
    setIdx((i) => (i + dir + tracks.length) % tracks.length);
  };

  const ctrl = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 38, height: 38, padding: 0, fontSize: 16, lineHeight: 1, borderRadius: 999,
    opacity: tracks.length > 1 ? 1 : 0.5,
  };
  const mid = { ...ctrl, width: 48, height: 48, fontSize: 19, opacity: current ? 1 : 0.5 };
  const songName = !current ? "no song added yet" : current.title || "track " + (idx + 1);
  const counter = current && tracks.length > 1 ? `${idx + 1} / ${tracks.length}` : "";

  return (
    <div className="ambient-widget widget-left" style={{ left: "max(8px, calc(25vw - 300px))", top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", pointerEvents: "none" }}>
      {current ? (
        <audio
          ref={audioRef}
          src={current.src}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => (tracks.length > 1 ? step(1) : setPlaying(false))}
          onLoadedMetadata={(e) => setDuration(e.target.duration || 0)}
          onDurationChange={(e) => setDuration(e.target.duration || 0)}
          onTimeUpdate={(e) => { if (!scrubbing) setCurTime(e.target.currentTime); }}
          onError={() => {
            setPlaying(false);
          }}
        />
      ) : null}
      <div style={{ pointerEvents: "auto", background: "rgba(255,249,236,.42)", border: "3px solid rgba(226,207,192,.9)", borderRadius: 28, padding: "11px 11px 10px", boxShadow: "0 6px 16px rgba(107,83,53,.18), 0 4px 18px rgba(239,147,174,.14)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", display: "inline-block" }}>
      <div ref={discRef} className={playing ? "cd-spinning" : ""} style={{ width: 115, height: 115, margin: "0 auto" }}>
        <svg width="115" height="115" viewBox="0 0 78 78" aria-hidden="true" style={{ display: "block" }}>
          <circle cx="39" cy="39" r="36" fill="#f0e6d2" stroke="#8b6f47" strokeWidth="3" />
          <circle cx="39" cy="39" r="28" fill="none" stroke="#d9c6a0" strokeWidth="1.6" />
          <circle cx="39" cy="39" r="22" fill="none" stroke="#d9c6a0" strokeWidth="1.6" />
          <path d="M39 11 a28 28 0 0 1 24 14" stroke={disc[0]} strokeWidth="3" fill="none" strokeLinecap="round" style={{ transition: "stroke .5s ease" }} />
          <path d="M39 67 a28 28 0 0 1 -24 -14" stroke={disc[1]} strokeWidth="3" fill="none" strokeLinecap="round" style={{ transition: "stroke .5s ease" }} />
          <circle cx="39" cy="39" r="10" fill="#fff9ec" stroke="#8b6f47" strokeWidth="2.5" />
          <circle cx="39" cy="39" r="16" fill="none" stroke={disc[0]} strokeWidth="1.4" opacity=".55" style={{ transition: "stroke .5s ease" }} />
          <circle cx="39" cy="39" r="3.4" fill="#8b6f47" />
        </svg>
      </div>
      {/* progress bar: click or drag to jump to a point in the song */}
      <div
        style={{ marginTop: 8, width: 125, pointerEvents: current ? "auto" : "none", opacity: current ? 1 : 0.4 }}
      >
        <div
          ref={barRef}
          onMouseDown={startScrub}
          onTouchStart={startScrub}
          style={{
            position: "relative", width: "100%", height: 10, display: "flex", alignItems: "center",
            cursor: current ? "pointer" : "default",
          }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 999, background: "rgba(139,111,71,.22)" }} />
          <div
            style={{
              position: "absolute", left: 0, height: 4, borderRadius: 999,
              width: `${duration ? ((scrubbing ? scrubTime : curTime) / duration) * 100 : 0}%`,
              background: disc[0], transition: scrubbing ? "none" : "width .15s linear, background .5s ease",
            }}
          />
          <div
            style={{
              position: "absolute", width: 11, height: 11, borderRadius: "50%",
              left: `calc(${duration ? ((scrubbing ? scrubTime : curTime) / duration) * 100 : 0}% - 5.5px)`,
              background: disc[0], border: "2px solid #fff9ec", boxShadow: "0 1px 3px rgba(107,83,53,.35)",
              transition: scrubbing ? "none" : "left .15s linear, background .5s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7a5a3a", marginTop: 2, fontWeight: 500 }}>
          <span>{fmtTime(scrubbing ? scrubTime : curTime)}</span>
          <span>{fmtTime(duration)}</span>
        </div>
      </div>
      
      <div
        title={songName}
        style={{
          marginTop: 7, width: 125, minHeight: 34,
          fontSize: 13.5, lineHeight: 1.3, fontWeight: 700,
          color: current ? "#4a3b28" : "#8a755a",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden", wordBreak: "break-word",
        }}
      >
        {songName}
      </div>
      {counter ? (
        <div style={{ fontSize: 11, color: "#7a5a3a", marginTop: 2, fontWeight: 600, letterSpacing: ".04em" }}>{counter}</div>
      ) : null}
      <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <button onClick={() => step(-1)} aria-label="Previous song" className="btn btn-yellow" style={ctrl}>
          {"\u23EE"}
        </button>
        <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="btn btn-yellow" style={mid}>
          {playing ? "\u275A\u275A" : "\u25B6"}
        </button>
        <button onClick={() => step(1)} aria-label="Next song" className="btn btn-yellow" style={ctrl}>
          {"\u23ED"}
        </button>
      </div>
      </div>
    </div>
  );
}