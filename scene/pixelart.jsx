/* pixelart.jsx
   Turns the artwork in pixeldata.js into things you can place in the scene:
   houses, trees, bushes, farm props, the sun and the moon, each handling its
   own size, night glow and grounding shadow. */

import { PixelGrid, SPARKLE_CHERRY, SPARKLE_GREEN, Sparkles, findCells } from "./pixelcore.jsx";
import { BUSH_GRIDS, FARM_PROPS, HOUSE_GRIDS, MOON_GRID, SUN_GRID, TREE_GRIDS } from "./pixeldata.js";

export function PixelHouse({ variant, size, night }) {
  const def = HOUSE_GRIDS[variant] || HOUSE_GRIDS.A;
  const cols = def.rows[0].length;
  const px = size / cols;
  return (
    <div style={{ position: "relative" }}>
      {/* warm pool of light around the building at night, so the cabin sits in
          its own glow instead of going flat under the night relight */}
      {night && (
        <div
          className="lantern-glow"
          style={{
            position: "absolute", left: "50%", top: "62%", width: size * 1.25, height: size * 0.95,
            transform: "translate(-50%,-50%)", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(255,206,110,.42) 0%, rgba(255,196,90,.16) 45%, rgba(255,196,90,0) 72%)",
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ position: "relative", filter: night ? "brightness(1.22) saturate(1.25)" : "none" }}>
        <PixelGrid rows={def.rows} palette={def.palette} px={px} night={!!night} />
      </div>
    </div>
  );
}

/* ===================== Pixel trees & bushes =====================
   Hand-built grids in the exact same chunky style as the pixel houses,
   inspired by the reference sheets (rounded textured canopies, tiered
   conifer, wide flowering bush clusters) rather than pasted from them.
   Grid rendering means exact per-cell transparency: no white fringe. */

export const FarmProp = ({ kind, size = 60, night = false }) => {
  const def = FARM_PROPS[kind];
  return <PixelGrid rows={def.rows} palette={def.palette} px={size / def.rows[0].length} night={night} />;
};

export const PixelTree = ({ variant = "cherry", size = 140, flip = false, dur = "6.5s", delay = "0s", night = false, glow = true }) => {
  const def = TREE_GRIDS[variant] || TREE_GRIDS.cherry;
  const cols = def.rows[0].length;
  const px = size / cols;

  /* Measure the canopy itself (foliage cells only, ignoring the trunk) so
     the glow sits exactly on the leaves instead of on the grid's centre. */
  let minX = cols, maxX = 0, minY = def.rows.length, maxY = 0;
  const leaf = "ABCD";
  def.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (leaf.indexOf(row[x]) === -1) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  });
  const cw = (maxX - minX + 1) * px;
  const ch = (maxY - minY + 1) * px;
  const cx = (minX + (maxX - minX + 1) / 2) * px;
  const cy = (minY + (maxY - minY + 1) / 2) * px;
  const glowSize = Math.max(cw, ch) * 1.6;

  /* every 'a' cell is a piece of fruit; collect them so each can be lit */
  const apples = [];
  def.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === "a") apples.push({ x, y });
  });
  const fruitGlow = variant === "cherry" ? "rgba(255,138,186,.95)" : "rgba(150,240,140,.9)";

  return (
    <div style={{ transform: flip ? "scaleX(-1)" : "none", position: "relative" }}>
      {night && glow && (
      <div
        className="lantern-glow"
        style={{
          position: "absolute", left: cx, top: cy, width: glowSize, height: glowSize,
          marginLeft: -glowSize / 2, marginTop: -glowSize / 2, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${def.glow},${night ? 1 : 0.16}) 0%, rgba(${def.glow},${night ? 0.45 : 0.05}) 42%, rgba(${def.glow},0) 72%)`,
          pointerEvents: "none",
        }}
      />
      )}
      <div
        style={{
          position: "absolute", left: "50%", bottom: px * 0.4, width: size * 0.5, height: size * 0.09,
          transform: "translateX(-50%)", borderRadius: "50%",
          background: "rgba(58,42,30,.18)", pointerEvents: "none",
        }}
      />
      <PixelGrid rows={def.rows} palette={def.palette} px={px} night={false}
        className="swayer-soft" style={{ animationDuration: dur, animationDelay: delay, position: "relative" }} />
      {night && (
        <Sparkles count={6} size={Math.max(3, size * 0.032)}
          tone={variant === "cherry" ? SPARKLE_CHERRY : SPARKLE_GREEN}
          box={{ left: minX * px, top: minY * px, w: cw, h: ch }} />
      )}
      {/* apples stay lit rather than being dulled by the night relight */}
      {findCells(def.rows, "a").map((c, i) => {
        const glow = variant === "cherry" ? "255,95,165" : "80,230,105";
        const gsz = px * 4.6;
        return (
          <div
            key={`ap${i}`}
            className="lantern-glow"
            style={{
              position: "absolute", left: (c.x + 0.5) * px - gsz / 2, top: (c.y + 0.5) * px - gsz / 2,
              width: gsz, height: gsz, borderRadius: "50%", pointerEvents: "none", zIndex: 2,
              background: `radial-gradient(circle, rgba(${glow},${night ? 0.88 : 0.5}) 0%, rgba(${glow},${night ? 0.55 : 0.2}) 38%, rgba(${glow},0) 70%)`,
              mixBlendMode: "screen",
              animationDuration: `${2.6 + (i % 4) * 0.7}s`, animationDelay: `${-i * 0.5}s`,
            }}
          >
            <div style={{
              position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
              width: Math.max(2, px * 0.9), height: Math.max(2, px * 0.9), borderRadius: "50%",
              background: variant === "cherry" ? "#ff5fa4" : "#4ad46a",
              boxShadow: `0 0 ${px * 2}px ${px * 0.8}px rgba(${glow},.95)`,
            }} />
          </div>
        );
      })}
      {/* the fruit catches the light: a soft halo on each apple, brighter and
          gently pulsing once night falls */}
      {apples.map((ap, i) => {
        const d = Math.max(5, px * 3.2);
        return (
          <div
            key={`ap${i}`}
            className={night ? "lantern-glow" : undefined}
            style={{
              position: "absolute",
              left: (ap.x + 0.5) * px - d / 2,
              top: (ap.y + 0.5) * px - d / 2,
              width: d, height: d, borderRadius: "50%",
              background: `radial-gradient(circle, ${fruitGlow} 0%, transparent 70%)`,
              opacity: night ? 0.95 : 0.4,
              animationDelay: `${-i * 0.7}s`,
              pointerEvents: "none", zIndex: 3,
            }}
          />
        );
      })}
    </div>
  );
};

export const PixelBush = ({ variant = "floral", size = 130, dur = "5s", delay = "0s", night = false }) => {
  const def = BUSH_GRIDS[variant] || BUSH_GRIDS.floral;
  const cols = def.rows[0].length;
  const px = size / cols;
  return (
    <div style={{ position: "relative" }}>
      <div
        className="lantern-glow"
        style={{
          position: "absolute", left: "50%", top: "45%", width: size * 1.0, height: size * 1.0,
          transform: "translate(-50%,-50%)", borderRadius: "50%",
          background: `radial-gradient(circle, rgba(150,235,150,${night ? 0.65 : 0.12}) 0%, rgba(110,225,125,${night ? 0.3 : 0.06}) 45%, rgba(110,225,125,0) 72%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", left: "50%", bottom: px * 0.4, width: size * 0.5, height: size * 0.09,
          transform: "translateX(-50%)", borderRadius: "50%",
          background: "rgba(58,42,30,.18)", pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", left: "50%", bottom: 0, width: size * 0.62, height: size * 0.05,
          transform: "translateX(-50%)", borderRadius: "50%",
          background: "rgba(58,42,30,.15)", pointerEvents: "none",
        }}
      />
      <PixelGrid rows={def.rows} palette={def.palette} px={px} night={false}
        className="swayer-soft" style={{ animationDuration: dur, animationDelay: delay, position: "relative" }} />
      {night && (
        <Sparkles count={4} size={Math.max(3, size * 0.035)} tone={SPARKLE_GREEN}
          box={{ left: 0, top: size * 0.12, w: size, h: size * 0.5 }} />
      )}
    </div>
  );
};

export const CabinDoodle = ({ size = 140, night = false }) => (
  <PixelHouse variant="B" size={size} night={night} />
);

/* A full-width stream: a winding horizontal ribbon lying flat across
   the whole meadow, entering from the left edge of the screen, passing
   behind the cabin and flowing off the right edge, with light flow
   streaks along its length and drifting shimmer */

export const DistantCottage = ({ size = 70, night = false }) => (
  <PixelHouse variant="C" size={size} night={night} />
);

export const Sun = ({ size = 116 }) => (
  <div style={{ position: "relative" }}>
    <div
      className="lantern-glow"
      style={{
        position: "absolute", left: "50%", top: "50%", width: size * 1.5, height: size * 1.5,
        transform: "translate(-50%,-50%)", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,217,104,.45) 0%, rgba(255,233,168,0) 68%)",
        pointerEvents: "none",
      }}
    />
    <PixelGrid rows={SUN_GRID.rows} palette={SUN_GRID.palette} px={size / SUN_GRID.rows[0].length} night={false}
      style={{ position: "relative" }} />
  </div>
);

export const Moon = ({ size = 96 }) => (
  <div style={{ position: "relative" }}>
    <div
      className="lantern-glow"
      style={{
        position: "absolute", left: "50%", top: "50%", width: size * 1.7, height: size * 1.7,
        transform: "translate(-50%,-50%)", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(226,235,250,.34) 0%, rgba(226,235,250,0) 66%)",
        pointerEvents: "none",
      }}
    />
    <PixelGrid rows={MOON_GRID.rows} palette={MOON_GRID.palette} px={size / MOON_GRID.rows[0].length} night={false}
      style={{ position: "relative" }} />
  </div>
);
