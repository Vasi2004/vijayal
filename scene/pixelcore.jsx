/* pixelcore.jsx
   The engine behind all the pixel art. PixelGrid turns a grid of characters
   into crisp pixels, works out where windows are so they can be lit, draws
   chimney smoke, and adds the twinkling sparkles. The glow colours for
   windows and trees are set here, one per element. */

import { useRef } from "react";
import { prefersReducedMotion } from "../gsap.js";

export function findWindowRects(rows) {
  const seen = new Set();
  const out = [];
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] !== "X" || seen.has(`${x},${y}`)) continue;
      seen.add(`${x},${y}`);
      const stack = [[x, y]];
      let minX = x, maxX = x, minY = y, maxY = y;
      while (stack.length) {
        const [cx, cy] = stack.pop();
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
          const k = `${nx},${ny}`;
          if (!seen.has(k) && rows[ny] && rows[ny][nx] === "X") { seen.add(k); stack.push([nx, ny]); }
        }
      }
      out.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
    }
  }
  /* panes split by a mullion belong to one window: merge boxes that sit
     within a couple of cells of each other so each window gets a single glow */
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < out.length && !merged; i++) {
      for (let j = i + 1; j < out.length && !merged; j++) {
        const a = out[i], b = out[j];
        const near = a.x <= b.x + b.w + 2 && b.x <= a.x + a.w + 2 &&
                     a.y <= b.y + b.h + 2 && b.y <= a.y + a.h + 2;
        if (!near) continue;
        const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y);
        const x1 = Math.max(a.x + a.w, b.x + b.w), y1 = Math.max(a.y + a.h, b.y + b.h);
        out.splice(j, 1);
        out[i] = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
        merged = true;
      }
    }
  }
  return out;
}

/* Cells of a given character, used to light the apples */

export function findCells(rows, ch) {
  const out = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === ch) out.push({ x, y });
  });
  return out;
}

/* Glow colours are set explicitly per element so none of them fall back to a
   shared white. Keep the boost modest: brightness() scales every channel, so a
   large multiplier clips red/green and turns any warm colour white. */

export const GLOW_WINDOW = "255,150,40";     // house + cabin windows: warm amber

export const GLOW_CHERRY = "255,138,190";    // cherry canopies + their sparkle dots

export const GLOW_GREEN = "120,214,90";      // green trees + their sparkle dots

export const SPARKLE_CHERRY = "#ff6fae";

export const SPARKLE_GREEN = "#69dd7f";

export let PIXEL_GLOW_UID = 0;

/* Small heart used for the chimney puffs */

export const SMOKE_HEART_D = "M0 4 C-4.6 0.8 -5.6 -2.2 -3.4 -3.8 C-1.8 -5 -0.4 -4 0 -3 C0.4 -4 1.8 -5 3.4 -3.8 C5.6 -2.2 4.6 0.8 0 4 Z";

export function PixelGrid({ rows, palette, px, night, className = "", style = {} }) {
  const idRef = useRef(null);
  if (idRef.current === null) { PIXEL_GLOW_UID += 1; idRef.current = `winglow${PIXEL_GLOW_UID}`; }
  const glowId = idRef.current;
  const reducedMotion = prefersReducedMotion();
  const cols = rows[0].length;
  const h = rows.length;

  /* Group the window cells into rectangles so each window lights as one
     warm pane with soft light radiating around it, instead of every pixel
     glowing on its own. */
  const windows = findWindowRects(rows);

  const cells = [];
  const smoke = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const c = rows[y][x];
      if (c === ".") continue;
      if (c === "X") {
        /* glass is painted per window below so the frame can be a thin bar */
        continue;
      } else if (c === "V") {
        /* frame cells still need the wall painted underneath, otherwise they
           leave transparent holes and the scenery shows through as an outline.
           Take the colour from the nearest wall cell on the same row. */
        let wall = null;
        for (let sx = x - 1; sx >= 0 && !wall; sx--) {
          const wc = rows[y][sx];
          if ("lLgOo".indexOf(wc) !== -1) wall = palette[wc];
        }
        for (let sx = x + 1; sx < rows[y].length && !wall; sx++) {
          const wc = rows[y][sx];
          if ("lLgOo".indexOf(wc) !== -1) wall = palette[wc];
        }
        cells.push(<rect key={`v${x}-${y}`} x={x} y={y} width="1" height="1"
          fill={wall || palette.l || "#c79a63"} />);
      } else if (c === "S") {
        smoke.push({ x, y });
      } else {
        const fill = palette[c];
        if (fill) cells.push(<rect key={`c${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />);
      }
    }
  }


  return (
    <svg width={cols * px} height={h * px} viewBox={`0 0 ${cols} ${h}`} shapeRendering="crispEdges"
      aria-hidden="true" className={className} style={{ display: "block", ...style }}>
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor={`rgba(${GLOW_WINDOW},${night ? 0.95 : 0.35})`} />
          <stop offset="42%" stopColor={`rgba(${GLOW_WINDOW},${night ? 0.42 : 0.14})`} />
          <stop offset="72%" stopColor={`rgba(${GLOW_WINDOW},0)`} />
        </radialGradient>
      </defs>
      {cells}
      {/* lit glass fills the whole opening ... */}
      {windows.map((w, i) => (
        <rect key={`gl${i}`} x={w.x} y={w.y} width={w.w} height={w.h}
          fill={night ? "#ffcf5e" : "#ffd98a"} />
      ))}
      {/* ... the glow sits over the glass but under the frame ... */}
      {windows.map((w, i) => (
        <circle key={`glow${i}`} className="lantern-glow"
          cx={w.x + w.w / 2} cy={w.y + w.h / 2}
          r={Math.max(w.w, w.h) * (night ? 3.4 : 1.8)}
          fill={`url(#${glowId})`} shapeRendering="geometricPrecision" />
      ))}
      {/* ... and the frame goes on top as slim bars */}
      {windows.map((w, i) => {
        const fc = palette.V || "#6b4a30";
        const t = 0.62;
        return (
          <g key={`fr${i}`} shapeRendering="geometricPrecision">
            <rect x={w.x - t / 2} y={w.y - t / 2} width={w.w + t} height={w.h + t}
              fill="none" stroke={fc} strokeWidth={t} />
            <line x1={w.x + w.w / 2} y1={w.y} x2={w.x + w.w / 2} y2={w.y + w.h}
              stroke={fc} strokeWidth={t * 0.8} />
            <line x1={w.x} y1={w.y + w.h / 2} x2={w.x + w.w} y2={w.y + w.h / 2}
              stroke={fc} strokeWidth={t * 0.8} />
          </g>
        );
      })}
      {smoke.map((sm, i) => (
        reducedMotion ? (
          <path key={`sm${i}`} d={SMOKE_HEART_D} fill="#ece5d6" opacity=".55"
            transform={`translate(${sm.x + 0.5} ${sm.y + 0.5}) scale(0.2)`} />
        ) : (
          <g key={`sm${i}`} opacity="0">
            <path d={SMOKE_HEART_D} fill="#f2ece0" transform={`scale(${0.18 + (i % 3) * 0.04})`} />
            {/* each puff drifts up and sideways, then fades, on its own offset */}
            <animateTransform attributeName="transform" type="translate"
              values={`${sm.x + 0.5} ${sm.y + 0.5}; ${sm.x + 1.5} ${sm.y - 3.8}; ${sm.x + 0.2} ${sm.y - 7.6}`}
              keyTimes="0;0.5;1" dur={`${6.0 + (i % 4) * 0.7}s`}
              begin={`${-i * 0.28}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.9;0.65;0" keyTimes="0;0.18;0.6;1"
              dur={`${6.0 + (i % 4) * 0.7}s`} begin={`${-i * 0.28}s`} repeatCount="indefinite" />
          </g>
        )
      ))}
    </svg>
  );
}

export const SPARKLE_SPOTS = [
  { l: 26, t: 22 }, { l: 62, t: 18 }, { l: 44, t: 38 }, { l: 74, t: 44 },
  { l: 18, t: 48 }, { l: 54, t: 58 }, { l: 84, t: 30 }, { l: 34, t: 64 },
];

export const Sparkles = ({ count = 5, size = 4, tone = "#a9d582", box }) => (
  <>
    {SPARKLE_SPOTS.slice(0, count).map((sp, i) => (
      <div
        key={i}
        className="twinkle-star"
        style={{
          position: "absolute",
          left: box.left + (box.w * sp.l) / 100,
          top: box.top + (box.h * sp.t) / 100,
          width: size, height: size, borderRadius: "50%", background: tone,
          boxShadow: `0 0 ${size * 2.6}px ${size}px ${tone}`,
          mixBlendMode: "screen",
          animationDuration: `${2.2 + (i % 4) * 0.8}s`, animationDelay: `${-i * 0.6}s`,
          pointerEvents: "none", zIndex: 2,
        }}
      />
    ))}
  </>
);

/* Little farm props that sit beside the cabin: a vegetable patch, a
   campfire (its flame uses the glowing-window cell so it lights up at
   night), a stack of hay bales and a small tractor. */
