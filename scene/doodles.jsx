/* doodles.jsx
   The small hand-drawn bits: flowers, grass tufts, the bunny, clouds, tab
   icons, the pencil and back arrow, clothespins, hearts, the lampposts and
   their night glow, and the day/night switch. */

import { PixelHouse } from "./pixelart.jsx";
import { useEffect, useRef } from "react";

/* ===================== Little doodles (SVG) ===================== */

export const FlowerDoodle = ({ size = 34, petal = "#f3a5b5", center = "#f5d76e", dur = "3.6s", delay = "0s" }) => (
  <svg className="swayer" style={{ animationDuration: dur, animationDelay: delay }} width={size} height={size * 1.5} viewBox="0 0 34 51" aria-hidden="true">
    <path d="M17 50 C17 40 16 34 17 26" stroke="#6ca24f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <path d="M17 38 C12 36 9 33 8 30" stroke="#6ca24f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx="17" cy="9" rx="5.5" ry="8" fill={petal} transform={`rotate(${a} 17 17)`} />
    ))}
    <circle cx="17" cy="17" r="5" fill={center} stroke="#d9b13b" strokeWidth="1.5" />
  </svg>
);

export const GrassTuft = ({ h = 30, dur = "3s", delay = "0s" }) => (
  <svg className="grass-tuft" style={{ animationDuration: dur, animationDelay: delay }} width={h * 0.9} height={h} viewBox="0 0 27 30" aria-hidden="true">
    <path d="M4 30 C5 20 3 14 2 8" stroke="#5f9445" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M13 30 C13 18 12 12 13 3" stroke="#74ab55" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M22 30 C21 21 24 15 25 9" stroke="#5f9445" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

export const BunnyDoodle = ({ size = 56 }) => {
  const bunnyRef = useRef(null);

  useEffect(() => {
    const el = bunnyRef.current;
    if (!el) return;

    let timeoutId;
    const hop = () => {
      if (window.gsap) {
        window.gsap.to(el, {
          y: -12,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
          ease: "power1.out",
          onComplete: () => {
            const randomDelay = (4 + Math.random() * 6) * 1000;
            timeoutId = setTimeout(hop, randomDelay);
          }
        });
      }
    };

    const initialDelay = (3 + Math.random() * 5) * 1000;
    timeoutId = setTimeout(hop, initialDelay);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <svg ref={bunnyRef} className="breather" width={size} height={size} viewBox="0 0 60 60" aria-hidden="true" style={{ willChange: "transform" }}>
      <g className="ear">
        <ellipse cx="24" cy="16" rx="5" ry="12" fill="#fdf3e3" stroke="#c9ab84" strokeWidth="2" />
        <ellipse cx="24" cy="17" rx="2.2" ry="8" fill="#f6cdd4" />
      </g>
      <ellipse cx="36" cy="16" rx="5" ry="12" fill="#fdf3e3" stroke="#c9ab84" strokeWidth="2" />
      <ellipse cx="36" cy="17" rx="2.2" ry="8" fill="#f6cdd4" />
      <ellipse cx="30" cy="42" rx="17" ry="14" fill="#fdf3e3" stroke="#c9ab84" strokeWidth="2" />
      <circle cx="24" cy="38" r="1.8" fill="#4a3b28" />
      <circle cx="36" cy="38" r="1.8" fill="#4a3b28" />
      <path d="M27 44 q3 3 6 0" stroke="#4a3b28" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="30" cy="42.5" rx="1.8" ry="1.3" fill="#f3a5b5" />
      <circle cx="19" cy="43" r="2.6" fill="#f6cdd4" opacity=".8" />
      <circle cx="41" cy="43" r="2.6" fill="#f6cdd4" opacity=".8" />
    </svg>
  );
};

/* ===================== Pixel-art houses & trees =====================
   Blocky, low-res grids rendered as crisp SVG rects, matching the retro
   pixel aesthetic of the walking character sprites. Each cell character
   maps to a palette color; 'X' cells are windows (self-contained glow
   that brightens at night, matching the lamppost lighting) and 'S' cells
   are chimney smoke (gentle drifting pulse). */

/* ===================== Pixel-art houses (rebuilt) =====================
   A small, self-contained renderer: each house is a grid of single
   characters mapped to a color. 'X' = window (glows, brighter at night),
   'S' = chimney smoke (soft drifting puff). Kept deliberately simple so
   there is nothing fragile between the data and what gets painted. */
/* Locate rectangular window clusters in a grid; shared by the renderer and
   by PixelHouse, which overlays a lamppost-style glow on each one. */


/* Tab icons, storybook style */

export const IconTimeline = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="4" fill="#fffdf6" stroke="#8b6f47" strokeWidth="2" />
    <path d="M3 10 h18" stroke="#8b6f47" strokeWidth="2" />
    <path d="M8 3 v4 M16 3 v4" stroke="#8b6f47" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="15" r="1.6" fill="#6fc7bd" />
    <circle cx="15" cy="15" r="1.6" fill="#f3a5b5" />
  </svg>
);

export const IconCamera = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2.5" y="7" width="19" height="13" rx="4" fill="#fffdf6" stroke="#8b6f47" strokeWidth="2" />
    <path d="M8 7 l2-3 h4 l2 3" fill="#f5d76e" stroke="#8b6f47" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="12" cy="13.5" r="3.6" fill="#bfe6f5" stroke="#8b6f47" strokeWidth="2" />
  </svg>
);

export const IconEnvelope = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2.5" y="5.5" width="19" height="14" rx="3.5" fill="#fffdf6" stroke="#8b6f47" strokeWidth="2" />
    <path d="M3.5 7.5 L12 14 L20.5 7.5" fill="none" stroke="#8b6f47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="15.5" r="1.4" fill="#f3a5b5" />
  </svg>
);

export const IconHearts = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5 C5.5 5 4 7 4 9 c0 3.4 4 5.6 5.5 6.8 C11 14.6 15 12.4 15 9 c0-2-1.5-4-4-4 -1.2 0-2.2.6-3 1.6 C8.9 5.6 8.6 5 8 5z" transform="translate(1.5 2)" fill="#f3a5b5" stroke="#8b6f47" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M17 4.5 c-1.4 0-2.3 1.1-2.3 2.3 0 1.9 2.3 3.2 3.1 3.9 .9-.7 3.2-2 3.2-3.9 0-1.2-.9-2.3-2.3-2.3 -.7 0-1.2.3-1.7.9 -.4-.6-.9-.9-1.6-.9z" transform="translate(0 .5)" fill="#b39ddb" stroke="#8b6f47" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

export const PencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20 l1.2-4.4 L16.4 4.4 a2.3 2.3 0 0 1 3.2 3.2 L8.4 18.8 z" fill="#f5d76e" stroke="#8b6f47" strokeWidth="2" strokeLinejoin="round" />
    <path d="M14.8 6 l3.2 3.2" stroke="#8b6f47" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const BackArrow = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M15 5 L7 12 L15 19" fill="none" stroke="#4a3b28" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Clothespin = () => (
  <svg width="16" height="26" viewBox="0 0 16 26" aria-hidden="true" style={{ display: "block" }}>
    <rect x="4.5" y="1" width="7" height="24" rx="3.2" fill="#d8ab6e" stroke="#8b6f47" strokeWidth="1.6" />
    <path d="M4.5 12 h7" stroke="#8b6f47" strokeWidth="1.4" />
  </svg>
);

/* ===================== Scenery pieces ===================== */

export const HeartShape = ({ size = 14, fill = "#f3a5b5", stroke = "none", opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", opacity }} aria-hidden="true">
    <path d="M12 21 C7 16.6 2.5 13.4 2.5 8.8 2.5 5.8 4.8 3.6 7.5 3.6 c1.8 0 3.4.9 4.5 2.5 1.1-1.6 2.7-2.5 4.5-2.5 2.7 0 5 2.2 5 5.2 0 4.6-4.5 7.8-9.5 12.2z" fill={fill} stroke={stroke} strokeWidth={stroke === "none" ? 0 : 1.6} strokeLinejoin="round" />
  </svg>
);

/* Blocky 8-bit style heart for retro pixel moments (e.g. the hug heart) */

export const PIXEL_HEART_ROWS = [
  "01100110",
  "11111111",
  "11111111",
  "11111111",
  "01111110",
  "00111100",
  "00011000",
];

export const PixelHeart = ({ size = 24, fill = "#f3a5b5", shade = "#ef93ae", opacity = 1 }) => (
  <svg width={size} height={size * (7 / 8)} viewBox="0 0 8 7" style={{ display: "block", opacity, imageRendering: "pixelated", shapeRendering: "crispEdges" }} aria-hidden="true">
    {PIXEL_HEART_ROWS.map((row, y) =>
      row.split("").map((c, x) => c === "1" ? (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={y >= 4 ? shade : fill} />
      ) : null)
    )}
  </svg>
);

export const Lantern = ({ size = 62 }) => {
  const glowRef = useRef(null);

  useEffect(() => {
    if (!window.gsap) return;
    const tl = window.gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(glowRef.current, {
      opacity: 0.45,
      duration: 0.12,
      ease: "power1.inOut"
    })
    .to(glowRef.current, {
      opacity: 0.9,
      duration: 0.25,
      ease: "power1.inOut"
    })
    .to(glowRef.current, {
      opacity: 0.6,
      duration: 0.18,
      ease: "power1.inOut"
    });

    return () => tl.kill();
  }, []);

  return (
    <svg width={size} height={size * 1.9} viewBox="0 0 62 118" aria-hidden="true" style={{ display: "block" }}>
      <circle className="lantern-glow" cx="31" cy="34" r="26" fill="#ffd98a" opacity=".55" />
      <path d="M31 118 V52" stroke="#7a5a3a" strokeWidth="6" strokeLinecap="round" />
      <rect x="19" y="18" width="24" height="32" rx="8" fill="#fff0c2" stroke="#8b6f47" strokeWidth="3" />
      <path d="M23 12 h16 l3 6 h-22 z" fill="#c98d5a" stroke="#8b6f47" strokeWidth="2.6" strokeLinejoin="round" />
      <circle ref={glowRef} className="lantern-glow" cx="31" cy="34" r="7" fill="#ffc94d" style={{ willChange: "opacity" }} />
      <path d="M22 118 h18" stroke="#7a5a3a" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
};

export const NightGlow = ({ size = 80, tone = "255,201,77", core = true, coreTone = null, delay = "0s", style = {} }) => (
  <div className="lantern-glow" style={{ position: "absolute", width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, rgba(${tone},.72) 0%, rgba(${tone},.26) 45%, transparent 70%)`, animationDelay: delay, ...style }}>
    {core && (
      <div style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
        width: Math.max(8, size * 0.14), height: Math.max(8, size * 0.14), borderRadius: "50%",
        background: coreTone || "#fff3c9",
        boxShadow: `0 0 10px 4px rgba(${tone},.9)`,
      }} />
    )}
  </div>
);

/* ===================== Day / night toggle ===================== */

export function DayNightToggle({ theme, setTheme }) {
  const night = theme === "night";
  const sq = { width: 40, height: 40, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .25s ease" };
  const sunActive = { ...sq, background: "var(--yellow)" };
  const sunIdle = { ...sq, background: "var(--beige)" };
  const nightBtn = { ...sq, borderLeft: "3px solid var(--brown)" };
  const moonActive = { ...nightBtn, background: "#3a3166" };
  const moonIdle = { ...nightBtn, background: "var(--beige)" };
  return (
    <div
      role="radiogroup"
      aria-label="Day or night mode"
      style={{
        position: "fixed", top: 14, left: 14, zIndex: 30,
        display: "flex", borderRadius: 14, overflow: "hidden",
        border: "3px solid var(--brown)", boxShadow: "0 3px 0 var(--brown)",
      }}
    >
      <button
        onClick={() => setTheme("day")}
        aria-label="Switch to day mode"
        role="radio"
        aria-checked={!night}
        style={!night ? sunActive : sunIdle}
      >
        <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="3.2" fill={!night ? "#8b6f47" : "#b09a76"} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="8" y1="1.2" x2="8" y2="3" stroke={!night ? "#8b6f47" : "#b09a76"} strokeWidth="1.8" strokeLinecap="round" transform={`rotate(${a} 8 8)`} />
          ))}
        </svg>
      </button>
      <button
        onClick={() => setTheme("night")}
        aria-label="Switch to night mode"
        role="radio"
        aria-checked={night}
        style={night ? moonActive : moonIdle}
      >
        <svg width="19" height="19" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M11.5 9.6 A5.4 5.4 0 1 1 6.4 2.5 A4.4 4.4 0 0 0 11.5 9.6z" fill={night ? "#fff9ec" : "#b09a76"} />
        </svg>
      </button>
    </div>
  );
}

/* ===================== Music widget (CD player shell) ===================== */

/* Drop the song URL in here when it's ready; loop stays on, no autoplay */
/* The CD's playlist, in the order of the YouTube playlist. Each src is a
   direct audio link (Dropbox links must end in raw=1, otherwise they serve a
   preview page instead of the file). */

/* Pixel clouds for the far sky: chunky, soft-edged clusters that drift slowly
   across the top of the scene. Drawn from character grids like the rest of the
   pixel art, in whites with a soft shaded underside so they sit against the
   sky rather than punching a hole in it. */
const CLOUD_GRIDS = {
  /* Each shape is deliberately lopsided so they never read as the same cloud
     twice. 'W' is the lit body, 'w' the shaded underside. */
  bank: [
    "......WWWWWW........",
    "....WWWWWWWWWW..WW..",
    "..WWWWWWWWWWWWWWWWW.",
    ".WWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWW",
    "wWWWWWWWWWWWWWWWWWWw",
    ".wwWWWWWWWWWWWWWWww.",
    "...wwwwwwwwwwwwww...",
  ],
  wide: [
    "........WWWW........",
    "...WW.WWWWWWWW..WW..",
    ".WWWWWWWWWWWWWWWWWW.",
    "WWWWWWWWWWWWWWWWWWWW",
    "wWWWWWWWWWWWWWWWWWWw",
    ".wwwWWWWWWWWWWWwww..",
    "....wwwwwwwwwww.....",
  ],
  tall: [
    "....WWWW......",
    "..WWWWWWWW....",
    ".WWWWWWWWWWW..",
    "WWWWWWWWWWWWW.",
    "WWWWWWWWWWWWWW",
    "wWWWWWWWWWWWWW",
    ".wWWWWWWWWWWWw",
    "..wwwWWWWWWww.",
    "....wwwwwww...",
  ],
  lumpy: [
    "...WW....WWWW....",
    ".WWWWWW.WWWWWWW..",
    "WWWWWWWWWWWWWWWW.",
    "WWWWWWWWWWWWWWWWW",
    "wWWWWWWWWWWWWWWWw",
    ".wwWWWWWWWWWWww..",
    "...wwwwwwwwww....",
  ],
  streak: [
    "......WWWWWWWW......",
    "..WWWWWWWWWWWWWWWW..",
    "WWWWWWWWWWWWWWWWWWWW",
    "wwWWWWWWWWWWWWWWWWww",
    "...wwwwwwwwwwwwww...",
  ],
  small: [
    "....WWWW....",
    "..WWWWWWWW..",
    ".WWWWWWWWWW.",
    "WWWWWWWWWWWW",
    "wWWWWWWWWWWw",
    ".wwwwwwwwww.",
  ],
  wisp: [
    "...WWWWW....",
    ".WWWWWWWWW..",
    "WWWWWWWWWWWW",
    "wwwWWWWWwww.",
    "....www.....",
  ],
  puff: [
    "..WWWW..",
    ".WWWWWW.",
    "WWWWWWWW",
    "wWWWWWWw",
    ".wwwwww.",
  ],
  tuft: [
    ".WWW..",
    "WWWWWW",
    "wWWWWw",
    ".wwww.",
  ],
};

export const PixelCloud = ({ variant = "bank", size = 190, top, dur = "90s", delay = "0s", opacity = 0.9, night = false }) => {
  const rows = CLOUD_GRIDS[variant] || CLOUD_GRIDS.bank;
  const cols = rows[0].length;
  const px = size / cols;
  const palette = night
    ? { W: "#cdd3ea", w: "#a9b0d0" }
    : { W: "#ffffff", w: "#f0dcea" };
  return (
    <div
      className="cloud"
      data-dur={parseFloat(dur)}
      style={{ position: "absolute", top, left: 0, animationDuration: dur, animationDelay: delay, opacity, pointerEvents: "none", willChange: "transform" }}
      aria-hidden="true"
    >
      <svg width={cols * px} height={rows.length * px} viewBox={`0 0 ${cols} ${rows.length}`} shapeRendering="crispEdges" style={{ display: "block" }}>
        {/* runs of the same colour become one rect instead of one per pixel,
            which cuts the shapes on screen by roughly six times */}
        {rows.flatMap((row, y) => {
          const out = [];
          let x = 0;
          while (x < row.length) {
            const c = row[x];
            if (c === ".") { x += 1; continue; }
            let run = 1;
            while (x + run < row.length && row[x + run] === c) run += 1;
            out.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height="1" fill={palette[c]} />);
            x += run;
          }
          return out;
        })}
      </svg>
    </div>
  );
};

/* Pixel wildflowers over both stretches of grass: the hillside across the
   water, and the meadow in front of it. Each is a small three-by-three bloom
   with a lighter middle. Heights are read from the river's two edges, so the
   far ones sit above the water and the near ones sit below it, and neither
   strays onto the water or up into the hills. */
const BANK_FAR = [6.67, 6.79, 6.51, 6.18, 6.16, 6.52, 6.58, 6.41, 6.31, 6.51, 6.96,
                  7.15, 7.17, 7.26, 7.67, 7.97, 7.96, 7.90, 7.99, 8.43, 8.83];
const BANK_NEAR = [3.83, 4.49, 4.52, 4.33, 4.31, 4.67, 4.78, 4.66, 4.55, 4.67, 5.09,
                   5.31, 5.33, 5.41, 5.77, 6.15, 6.20, 6.18, 6.33, 6.76, 7.17];
const FLOWER_TONES = [
  ["#f6a8c4", "#fff0b8"], ["#f2c5e0", "#ffffff"], ["#c9a4e4", "#fff0b8"],
  ["#fdf6e3", "#f7d566"], ["#ef8fb3", "#ffe6a8"], ["#ffd0e0", "#ffffff"],
];

const readBank = (table, x) => {
  const t = (x / 100) * (table.length - 1);
  const lo = Math.min(table.length - 1, Math.floor(t));
  const hi = Math.min(table.length - 1, lo + 1);
  return table[lo] + (table[hi] - table[lo]) * (t - lo);
};

export const MeadowFlowers = ({ far = 45, near = 55, back = 38, night = false }) => {
  const dots = [];
  /* one element per flower, its petals drawn with shadows rather than an svg
     of five shapes. Same look, a fraction of the rendering cost. */
  const bloom = (key, x, bottom, tone, px) => (
    <i
      key={key}
      style={{
        position: "absolute", left: `${x.toFixed(2)}%`, bottom,
        width: px, height: px, background: tone[1],
        boxShadow: `0 ${-px}px 0 ${tone[0]}, 0 ${px}px 0 ${tone[0]}, ${-px}px 0 0 ${tone[0]}, ${px}px 0 0 ${tone[0]}`,
        opacity: night ? 0.5 : 0.92, pointerEvents: "none",
      }}
    />
  );

  /* the hillside across the water */
  for (let i = 0; i < far; i++) {
    const fx = (i * 0.6180339887) % 1;
    const jitter = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const x = (fx * 100 + jitter * 1.4 + 100) % 100;
    const wobble = (Math.sin(i * 78.233) * 43758.5453) % 1;
    const b = readBank(BANK_FAR, x);
    const rise = 0.35 + Math.abs(wobble) * 2.1;
    const bottom = `max(calc(0.5vh + ${(b + 0.35).toFixed(2)}vw), min(calc(0.5vh + ${(b + rise).toFixed(2)}vw), 16.4vh))`;
    dots.push(bloom(`f${i}`, x, bottom, FLOWER_TONES[i % FLOWER_TONES.length], Math.abs(wobble) > 0.55 ? 2 : 1.5));
  }

  /* the upper slope behind the far bank, which was left bare */
  for (let i = 0; i < back; i++) {
    const fx = ((i + 0.27) * 0.6180339887) % 1;
    const jitter = (Math.sin(i * 33.71) * 43758.5453) % 1;
    const x = (fx * 100 + jitter * 2.2 + 100) % 100;
    const wobble = (Math.sin(i * 57.42) * 43758.5453) % 1;
    const b = readBank(BANK_FAR, x);
    /* sits above the near hillside band and stops short of the mountains */
    const lift = 2.6 + Math.abs(wobble) * 3.4;
    /* floor as well as ceiling: on wide, short windows the mountain line sits
       low, and without the floor these would drop into the river */
    const bottom = `max(calc(0.5vh + ${(b + 0.5).toFixed(2)}vw), min(calc(0.5vh + ${(b + lift).toFixed(2)}vw), 17.1vh))`;
    dots.push(bloom(`b${i}`, x, bottom, FLOWER_TONES[(i + 1) % FLOWER_TONES.length], Math.abs(wobble) > 0.6 ? 1.5 : 1));
  }

  /* the meadow in front, between the walking strip and the water's edge */
  for (let i = 0; i < near; i++) {
    const fx = ((i + 0.5) * 0.6180339887) % 1;
    const jitter = (Math.sin(i * 45.164) * 43758.5453) % 1;
    const x = (fx * 100 + jitter * 1.8 + 100) % 100;
    const wobble = (Math.sin(i * 91.7) * 43758.5453) % 1;
    const n = readBank(BANK_NEAR, x);
    /* sit somewhere in the band, never right at the waterline or the very
       bottom edge of the screen */
    const frac = 0.14 + Math.abs(wobble) * 0.66;
    const bottom = `calc(0.5vh + ${(n * frac).toFixed(2)}vw)`;
    dots.push(bloom(`n${i}`, x, bottom, FLOWER_TONES[(i + 3) % FLOWER_TONES.length], Math.abs(wobble) > 0.5 ? 2.5 : 2));
  }

  return <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>{dots}</div>;
};
