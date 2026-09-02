/* carousel.jsx
   The floating photo fan on the right of the screen, and the popup that
   opens when you click one. */

import { useState, useEffect, useRef } from "react";
import { HeartShape } from "./doodles.jsx";
import { prefersReducedMotion } from "../gsap.js";
import { StoredPhoto } from "../store.jsx";

export function PhotoCarousel({ sleeves }) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const ordered = [...(sleeves || [])].sort((a, b) => a.uploadedAt - b.uploadedAt);
  const keys = ordered.map((sl) => sl.photoKey).filter(Boolean);
  const total = keys.length;
  const scrollRef = useRef(null);
  const drag = useRef(null);

  /* slow continuous auto-scroll through the fan; paused while the popup is open */
  useEffect(() => {
    if (open || total <= 1 || prefersReducedMotion()) return;
    const iv = setInterval(() => setShift((v) => (v + 1) % total), 3000);
    return () => clearInterval(iv);
  }, [open, total]);

  /* size the fan to the open margin between the frame's edge and the screen,
     so it never overlaps the main framing panel */
  const [fanW, setFanW] = useState(320);
  useEffect(() => {
    const size = () => {
      const margin = window.innerWidth / 2 - 490 - 20; /* space right of the 980px frame */
      setFanW(Math.round(Math.min(440, Math.max(190, margin))));
    };
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, []);
  const cardW = Math.round(fanW * 0.36);
  const cardH = Math.round(cardW * 1.34);
  const spread = Math.round(fanW * 0.16);
  const fanH = cardH + 24;

  const cardStyle = (off) => ({
    position: "absolute", left: "50%", top: "50%",
    transform: `translate(-50%, -50%) translateX(${off * spread}px) rotateY(${off * -30}deg) scale(${1 - Math.abs(off) * 0.09})`,
    opacity: Math.max(0.1, 1 - Math.abs(off) * 0.26),
    zIndex: 20 - Math.abs(off),
    transition: "transform .8s ease, opacity .8s ease",
    width: cardW, height: cardH, borderRadius: 16, overflow: "hidden",
    border: "3px solid #fff", boxShadow: "0 4px 12px rgba(74,59,40,.3)", background: "#fdf3e3",
  });

  const onDown = (e) => { const el = scrollRef.current; if (!el) return; drag.current = { x: e.clientX, sl: el.scrollLeft }; };
  const onMove = (e) => { const el = scrollRef.current; if (!el || !drag.current) return; e.preventDefault(); el.scrollLeft = drag.current.sl - (e.clientX - drag.current.x); };
  const onUp = () => { drag.current = null; };
  const nudge = (dir) => { const el = scrollRef.current; if (el) el.scrollBy({ left: dir * 320, behavior: "smooth" }); };

  return (
    <>
      {/* 3D shear-angle fan: upright full-opacity photo at center, photos
          angling away and fading toward the edges; fully contained in the
          viewport and slowly auto-scrolling */}
      <button
        className="ambient-widget widget-right"
        onClick={() => setOpen(true)}
        aria-label="Open the photo gallery"
        style={{ right: 10, top: "50%", marginTop: -Math.round(fanH / 2), width: fanW, height: fanH, background: "none", border: "none", padding: 0, cursor: "pointer", perspective: "900px", overflow: "hidden", borderRadius: 26 }}
      >
        {total === 0
          ? [-2, -1, 0, 1, 2].map((off, i) => (
              <div key={i} style={cardStyle(off)}>
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: ["#f8c8d8", "#bfe6f5", "#ffe9a8", "#d8ecc7"][i % 4] }}>
                  <HeartShape size={30} fill={["#ef93ae", "#6fc7bd", "#e78f6c", "#8fbf6f"][i % 4]} />
                </div>
              </div>
            ))
          : keys.map((k, idx) => {
              const rel = (((idx - shift) % total) + total) % total;
              const off = rel <= total / 2 ? rel : rel - total;
              if (Math.abs(off) > 2) return null; /* max 5 photos in the fan */
              return (
                <div key={k} style={cardStyle(off)}>
                  <StoredPhoto pkey={k} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              );
            })}
      </button>

      {/* popup gallery over the middle of the screen */}
      {open && (
        <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 60 }}>
        <div
          className="panel pop-in"
          style={{ position: "relative", width: "min(960px, 94vw)", maxHeight: "80vh", padding: "58px 22px 72px", background: "var(--cream)" }}
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Close the gallery"
            className="btn btn-plain"
            style={{ position: "absolute", top: 12, left: 12, width: 40, height: 40, borderRadius: "50%", padding: 0, fontSize: 17, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {"\u2715"}
          </button>
          <h3 style={{ margin: "0 0 14px", textAlign: "center", fontWeight: 800, fontSize: 24 }}>our photos</h3>
          {keys.length === 0 ? (
            <p style={{ textAlign: "center", color: "#7a6647", padding: "40px 0" }}>No photos yet, kutty. Peg some up in the Photobooth first!</p>
          ) : (
            <div
              ref={scrollRef}
              onMouseDown={onDown}
              onMouseMove={onMove}
              onMouseUp={onUp}
              onMouseLeave={onUp}
              onDragStart={(e) => e.preventDefault()}
              className="no-scrollbar"
              style={{ display: "flex", gap: 14, overflowX: "auto", padding: "6px 4px 12px", cursor: drag.current ? "grabbing" : "grab", WebkitOverflowScrolling: "touch" }}
            >
              {keys.map((k) => (
                <div key={k} style={{ flex: "0 0 auto", height: "44vh", maxHeight: 380, borderRadius: 16, overflow: "hidden", border: "3px solid #e8cfc0", background: "#fdf3e3" }}>
                  <StoredPhoto pkey={k} alt="photo" style={{ height: "100%", width: "auto", display: "block", userSelect: "none" }} />
                </div>
              ))}
            </div>
          )}
          {keys.length > 0 && (
            <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 12 }}>
              <button className="btn btn-yellow" onClick={() => nudge(-1)} aria-label="Scroll photos left" style={{ width: 48, height: 42, padding: 0 }}>{"\u2190"}</button>
              <button className="btn btn-yellow" onClick={() => nudge(1)} aria-label="Scroll photos right" style={{ width: 48, height: 42, padding: 0 }}>{"\u2192"}</button>
            </div>
          )}
        </div>
        </div>
      )}
    </>
  );
}
