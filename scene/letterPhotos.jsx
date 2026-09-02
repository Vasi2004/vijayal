/* letterPhotos.jsx
   Shared between WriteMode.jsx (placing photos while writing) and
   LetterUnfoldDemo.jsx (showing them once a letter is opened), so a photo
   renders identically in both places rather than two implementations
   slowly drifting apart.

   Ported directly from the standalone write-mode-prototype.html this was
   built and tested in first -- the shape math and clip-paths here are
   unchanged from that file. */

export const PHOTO_SHAPES = [
  { key: "square",   label: "Square" },
  { key: "circle",   label: "Circle" },
  { key: "oval",     label: "Oval" },
  { key: "polaroid", label: "Polaroid" },
  { key: "heart",    label: "Heart" },
  { key: "star",     label: "Star" },
  { key: "arch",     label: "Arch" },
  { key: "cloud",    label: "Cloud" },
  { key: "flower",   label: "Flower" },
];

export const MAX_LETTER_PHOTOS = 6;

/* the background-size percentage that exactly covers a (roughly square)
   frame with no gaps, for a photo's own aspect ratio -- zoom is a
   multiplier on top of this, so zoom 1 always starts gap-free regardless
   of whether the photo is portrait, landscape or square. Note: this
   assumes a roughly square frame, true for 8 of the 9 shapes; oval (4:3)
   is a known minor approximation, same caveat as in the prototype. */
export function coverPercent(ratio, zoom) {
  const base = ratio >= 1 ? { w: ratio * 100, h: 100 } : { w: 100, h: (1 / ratio) * 100 };
  return { w: base.w * zoom, h: base.h * zoom };
}

/* the inline style for a single photo's background image, given its own
   ratio, crop position and zoom -- used for both the shape-picker preview
   and the actual placed/read photo */
export function photoBackgroundStyle(dataUrl, ratio, pos, zoom) {
  const p = pos || { x: 50, y: 50 };
  const z = zoom || 1;
  const sz = coverPercent(ratio || 1, z);
  return {
    backgroundImage: `url('${dataUrl}')`,
    backgroundPosition: `${p.x}% ${p.y}%`,
    backgroundSize: `${sz.w}% ${sz.h}%`,
  };
}

/* renders a single frame's actual image content -- shared by the writing
   screen and the letter reveal so a photo looks identical in both */
export function PhotoFrame({ shape, dataUrl, imgRatio, pos, zoom }) {
  const style = photoBackgroundStyle(dataUrl, imgRatio, pos, zoom);
  if (shape === "polaroid") {
    return <div className="pf-frame-body"><div className="pf-polaroid-img" style={style} /></div>;
  }
  return <div className="pf-frame-body" style={style} />;
}

/* renders the shared clip-path <defs> once -- mount this exactly once,
   high enough in the tree (App.jsx) that it's always present whether
   you're writing a letter or reading one, since both rely on these ids */
export function PhotoFrameDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <clipPath id="heartClip" clipPathUnits="objectBoundingBox">
          <path d="M0.5,0.92 C0.5,0.92 0.05,0.65 0.05,0.35 C0.05,0.15 0.2,0.02 0.38,0.02 C0.46,0.02 0.5,0.08 0.5,0.08 C0.5,0.08 0.54,0.02 0.62,0.02 C0.8,0.02 0.95,0.15 0.95,0.35 C0.95,0.65 0.5,0.92 0.5,0.92 Z" />
        </clipPath>
        <clipPath id="starClip" clipPathUnits="objectBoundingBox">
          <path d="M0.5,0.02 0.61,0.37 0.98,0.37 0.68,0.59 0.79,0.95 0.5,0.73 0.21,0.95 0.32,0.59 0.02,0.37 0.39,0.37 Z" />
        </clipPath>
        <clipPath id="cloudClip" clipPathUnits="objectBoundingBox">
          <path d="M0.08,0.65 C0.02,0.65 0,0.55 0.02,0.48 C0.04,0.4 0.12,0.36 0.18,0.38 C0.16,0.22 0.3,0.1 0.42,0.14 C0.48,0.02 0.68,0.02 0.74,0.14 C0.88,0.08 1,0.2 0.96,0.34 C1.02,0.4 1,0.52 0.92,0.56 C0.96,0.66 0.88,0.76 0.78,0.74 C0.74,0.86 0.56,0.9 0.46,0.82 C0.36,0.9 0.2,0.88 0.16,0.76 C0.06,0.78 -0.02,0.7 0.08,0.65 Z" />
        </clipPath>
        <clipPath id="flowerClip" clipPathUnits="objectBoundingBox">
          <path d="M0.5,0.02 C0.62,0.02 0.68,0.14 0.62,0.24 C0.74,0.16 0.88,0.22 0.9,0.34 C0.98,0.38 0.98,0.52 0.9,0.56 C0.98,0.64 0.92,0.78 0.8,0.78 C0.84,0.9 0.72,0.98 0.62,0.92 C0.6,1 0.4,1 0.38,0.92 C0.28,0.98 0.16,0.9 0.2,0.78 C0.08,0.78 0.02,0.64 0.1,0.56 C0.02,0.52 0.02,0.38 0.1,0.34 C0.12,0.22 0.26,0.16 0.38,0.24 C0.32,0.14 0.38,0.02 0.5,0.02 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
