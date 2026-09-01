/* weather.jsx
   Everything drifting through the air: falling petals and leaves, rising
   hearts, stars and shooting stars at night, and the heart-shaped fireworks.
   Also the shared animation loop that drives the ambient movement. */

import { useState, useEffect, useRef } from "react";
import { HeartShape, PixelHeart } from "./doodles.jsx";
import { prefersReducedMotion } from "../gsap.js";

/* Slow-falling green leaves, separate from the cherry blossom petals */

export const LEAVES = Array.from({ length: 9 }, (_, i) => ({
  left: (i * 41 + 9) % 100,
  size: 8 + ((i * 7) % 6),
  dur: 13 + ((i * 6) % 10),
  delay: -((i * 4.1) % 18),
  tone: ["#f6bccf", "#f9d3e0", "#ef93ae", "#fbe0ea"][i % 4],
}));

export const LeafLayer = () => (
  <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
    {LEAVES.map((l, i) => (
      <div key={i} className="leaf-fall" data-dur={l.dur} style={{ left: `${l.left}%`, animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s` }}>
        <svg width={l.size} height={l.size} viewBox="0 0 12 12">
          <path d="M6 1 C10 3 10 8 6 11 C2 8 2 3 6 1z" fill={l.tone} />
          <path d="M6 2 v8" stroke="#d97fa6" strokeWidth="0.6" opacity=".55" />
        </svg>
      </div>
    ))}
  </div>
);


/* ===================== GSAP animation engine ===================== */
/* Loaded from CDN; every animation keeps a CSS fallback until it's ready,

   so the scene still moves even if the script is unavailable */

/* Continuous cherry blossom petal fall across the whole scene */

export const PETALS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 9 + ((i * 13) % 8),
  dur: 9 + ((i * 7) % 9),
  delay: -((i * 3.3) % 16),
  alt: i % 2 === 1,
  tone: ["#f8c8d8", "#f3a5b5", "#fad3e0", "#ef93ae"][i % 4],
}));

export const PetalLayer = () => (
  <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
    {PETALS.map((p, i) => (
      <div key={i} className={`petal ${p.alt ? "petal-b" : ""}`} data-dur={p.dur} style={{ left: `${p.left}%`, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}>
        <svg width={p.size} height={p.size} viewBox="0 0 12 12">
          <path d="M6 0 C9.5 2 11 5.5 6 12 C1 5.5 2.5 2 6 0z" fill={p.tone} />
        </svg>
      </div>
    ))}
  </div>
);

/* Soft pixel-style hearts drifting upward, day mode only */

export const FLOAT_HEARTS = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 23 + 6) % 97,
  size: 13 + ((i * 5) % 10),
  dur: 12 + ((i * 5) % 11),
  delay: -((i * 3.7) % 20),
  tone: ["#f3a5b5", "#f8c8d8", "#fad3e0", "#ef93ae"][i % 4],
  shade: ["#ef93ae", "#f3a5b5", "#f6bccf", "#e2789a"][i % 4],
}));

export const HeartsLayer = () => (
  <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
    {FLOAT_HEARTS.map((h, i) => (
      <div key={i} className="float-heart" data-dur={h.dur} style={{ left: `${h.left}%`, animationDuration: `${h.dur}s`, animationDelay: `${h.delay}s` }}>
        <PixelHeart size={h.size} fill={h.tone} shade={h.shade} opacity={0.55} />
      </div>
    ))}
  </div>
);

export function useGsapAmbient(ready, deps) {
  useEffect(() => {
    if (!ready || !window.gsap || prefersReducedMotion()) return;
    const g = window.gsap;
    document.documentElement.classList.add("gsap-on");
    const tweens = [];
    const durOf = (el, fb) => {
      const d = parseFloat(el.style.animationDuration);
      return isNaN(d) ? fb : Math.abs(d);
    };
    const rand = Math.random;

    /* Clouds are deliberately left to CSS: a vw-based keyframe always crosses
       the full width, and it keeps drifting through a theme change instead of
       being rebuilt from scratch. */
    document.querySelectorAll(".swayer").forEach((el) => {
      const t = g.fromTo(el, { rotation: -7, transformOrigin: "bottom center" }, { rotation: 8, duration: durOf(el, 3) / 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      t.progress(rand()); tweens.push(t);
    });
    document.querySelectorAll(".swayer-soft").forEach((el) => {
      const t = g.fromTo(el, { rotation: -2.5, transformOrigin: "bottom center" }, { rotation: 3, duration: durOf(el, 6.5) / 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      t.progress(rand()); tweens.push(t);
    });
    document.querySelectorAll(".grass-tuft").forEach((el) => {
      const t = g.fromTo(el, { skewX: -8, transformOrigin: "bottom center" }, { skewX: 9, duration: durOf(el, 2.8) / 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      t.progress(rand()); tweens.push(t);
    });
    document.querySelectorAll(".breather").forEach((el) => {
      const t = g.fromTo(el, { scale: 1, transformOrigin: "bottom center" }, { scale: 1.07, duration: durOf(el, 4) / 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      t.progress(rand()); tweens.push(t);
    });
    document.querySelectorAll(".petal").forEach((el) => {
      const d = durOf(el, 12);
      g.set(el, { opacity: 0.92 });
      const fall = g.fromTo(el, { y: -80, rotation: 0 }, { y: () => window.innerHeight + 80, rotation: 400, duration: d, ease: "none", repeat: -1, repeatRefresh: true });
      const sway = g.fromTo(el, { x: -46 }, { x: 52, duration: d / 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      fall.progress(rand()); sway.progress(rand());
      tweens.push(fall, sway);
    });
    document.querySelectorAll(".float-heart").forEach((el) => {
      const d = durOf(el, 18);
      g.set(el, { opacity: 0.5 });
      const rise = g.fromTo(el, { y: 60 }, { y: () => -(window.innerHeight * 0.9), duration: d, ease: "none", repeat: -1, repeatRefresh: true });
      const sway = g.fromTo(el, { x: -28 }, { x: 30, duration: d / 3.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
      rise.progress(rand()); sway.progress(rand());
      tweens.push(rise, sway);
    });
    document.querySelectorAll(".leaf-fall").forEach((el) => {
      const d = durOf(el, 15);
      g.set(el, { opacity: 0.85 });
      const fall = g.fromTo(el, { y: -80, rotation: 0 }, { y: () => window.innerHeight + 80, rotation: 100, duration: d, ease: "none", repeat: -1, repeatRefresh: true });
      const sway = g.fromTo(el, { x: -34 }, { x: 34, duration: d / 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
      fall.progress(rand()); sway.progress(rand());
      tweens.push(fall, sway);
    });

    return () => {
      tweens.forEach((t) => t.kill());
      document.documentElement.classList.remove("gsap-on");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ...deps]);
}

/* Fireworks: frequent soft bursts. Two kinds alternate: a radial spray
   of glowing heart sparks, and a burst whose sparks fly outward into an
   actual heart outline. First one fires right after load. */

export const heartPoint = (t, scale) => {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x: x * scale, y: -y * scale };
};

export function HeartFireworks({ night = false }) {
  const [bursts, setBursts] = useState([]);
  const kindRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let alive = true;
    const timers = [];
    const makeBurst = () => {
      if (!alive) return;
      const id = Date.now() + Math.random();
      const kind = kindRef.current % 2 === 0 ? "heart" : "radial";
      kindRef.current += 1;
      const burst = {
        id,
        kind,
        x: 12 + Math.random() * 76,
        y: 10 + Math.random() * 32,
        tone: ["#f3a5b5", "#ef93ae", "#c9b6e4", "#f5d76e", "#8fd8cf"][Math.floor(Math.random() * 5)],
      };
      setBursts((b) => [...b.slice(-8), burst]);   // cap how many animate at once
      timers.push(setTimeout(() => { if (alive) setBursts((b) => b.filter((x) => x.id !== id)); }, 1800));
    };

    if (night) {
      /* Opening celebration: still a long run of fireworks, but they arrive in
         small waves with breathing room between them. Firing 45 in a tight
         block meant dozens of particle sets animating at once, which is what
         made the switch to night stutter. */
      let when = 120;
      const volley = [2, 3, 2, 3, 2, 3, 2, 2, 3, 2, 2, 3, 2, 2];  // 33 bursts
      volley.forEach((count, wave) => {
        for (let i = 0; i < count; i++) {
          timers.push(setTimeout(makeBurst, when + i * 190));
        }
        when += 520 + (wave % 3) * 130;
      });
      let loopT = null;
      const loop = () => {
        const n = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) timers.push(setTimeout(makeBurst, i * 320));
        loopT = setTimeout(loop, 4000 + Math.random() * 1000);
      };
      loopT = setTimeout(loop, 4000 + Math.random() * 1000);
      return () => { alive = false; clearTimeout(loopT); timers.forEach(clearTimeout); };
    }

    /* daytime: an occasional gentle burst */
    let t = setTimeout(function loop() { makeBurst(); t = setTimeout(loop, 6000 + Math.random() * 5000); }, 700);
    return () => { alive = false; clearTimeout(t); timers.forEach(clearTimeout); };
  }, [night]);

  /* GSAP drives the particle motion when available; CSS vars are the fallback */
  const animateBurst = (el) => {
    if (!el || el.dataset.fired) return;
    el.dataset.fired = "1";
    if (window.gsap && !prefersReducedMotion()) {
      const g = window.gsap;
      el.querySelectorAll(".burst-heart").forEach((pt) => {
        g.fromTo(pt, { x: 0, y: 0, scale: 0.3, opacity: 0 }, {
          x: parseFloat(pt.dataset.bx), y: parseFloat(pt.dataset.by), scale: 1,
          duration: 1.5, ease: "power2.out", delay: parseFloat(pt.dataset.d || 0),
        });
        g.to(pt, { keyframes: [{ opacity: 1, duration: 0.16 }, { opacity: 0.9, duration: 0.85 }, { opacity: 0, duration: 0.49 }], delay: parseFloat(pt.dataset.d || 0) });
      });
    }
  };

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {bursts.map((b) => (
        <div key={b.id} ref={animateBurst} style={{ position: "absolute", left: `${b.x}%`, top: `${b.y}%` }}>
          {b.kind === "heart"
            ? Array.from({ length: 18 }, (_, i) => {
                const pt = heartPoint((i / 18) * Math.PI * 2, 5.5);
                const d = (i % 4) * 0.04;
                return (
                  <div key={i} className="burst-heart" data-bx={pt.x} data-by={pt.y} data-d={d} style={{ "--bx": `${pt.x}px`, "--by": `${pt.y}px`, animationDelay: `${d}s` }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.tone, boxShadow: `0 0 10px 3px ${b.tone}` }} />
                  </div>
                );
              })
            : Array.from({ length: 14 }, (_, i) => {
                const ang = (i / 14) * Math.PI * 2;
                const dist = 62 + (i % 3) * 22;
                const bx = Math.cos(ang) * dist, by = Math.sin(ang) * dist;
                const d = (i % 3) * 0.05;
                return (
                  <div key={i} className="burst-heart" data-bx={bx} data-by={by} data-d={d} style={{ "--bx": `${bx}px`, "--by": `${by}px`, animationDelay: `${d}s` }}>
                    <HeartShape size={13 + (i % 3) * 4} fill={b.tone} />
                  </div>
                );
              })}
          <div className="burst-heart" data-bx="0" data-by="-14" data-d="0" style={{ "--bx": "0px", "--by": "-14px" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: `0 0 18px 8px ${b.tone}` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export const srand = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const STARS = Array.from({ length: 40 }, (_, i) => ({
  left: srand(i) * 100,
  top: srand(i + 57) * 64,
  size: 1.6 + srand(i + 131) * 3,
  dur: 2 + srand(i + 211) * 3.4,
  delay: -srand(i + 307) * 5,
  tone: i % 7 === 0 ? "#ffe9a8" : i % 5 === 0 ? "#cfe6ff" : "#ffffff",
}));

export const StarsLayer = () => (
  <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {STARS.map((st, i) => (
      <div key={i} className="twinkle-star" style={{ position: "absolute", left: `${st.left}%`, top: `${st.top}%`, width: st.size, height: st.size, borderRadius: "50%", background: st.tone, boxShadow: `0 0 ${st.size * 2}px ${st.tone}`, animationDuration: `${st.dur}s`, animationDelay: `${st.delay}s` }} />
    ))}
  </div>
);

/* JS-spawned shooting stars: a bright head with a fading trail streaks
   across the sky in under a second, every few seconds at random spots */

export function ShootingStars() {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let alive = true;
    let timer = null;
    const spawn = () => {
      if (!alive) return;
      const id = Date.now() + Math.random();
      setStars((arr) => [...arr.slice(-2), {
        id,
        left: 35 + Math.random() * 58,
        top: 3 + Math.random() * 24,
        dur: 0.55 + Math.random() * 0.45,
      }]);
      setTimeout(() => { if (alive) setStars((arr) => arr.filter((x) => x.id !== id)); }, 1600);
      timer = setTimeout(spawn, 3000 + Math.random() * 4500);
    };
    timer = setTimeout(spawn, 1000);
    return () => { alive = false; clearTimeout(timer); };
  }, []);
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {stars.map((st) => (
        <div key={st.id} className="shoot-move" style={{ position: "absolute", left: `${st.left}%`, top: `${st.top}%`, animationDuration: `${st.dur}s` }}>
          <div style={{ transform: "rotate(149deg)", transformOrigin: "left center" }}>
            <div style={{ position: "relative", width: 130, height: 4 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.85))" }} />
              <div style={{ position: "absolute", right: -4, top: -3, width: 10, height: 10, borderRadius: "50%", background: "#fff", boxShadow: "0 0 12px 4px rgba(255,255,255,.95), 0 0 26px 8px rgba(207,230,255,.6)" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Warm glow spots that sit above the night relight filter so windows
   and lanterns visibly light up after dark */
