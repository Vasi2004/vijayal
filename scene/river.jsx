/* river.jsx
   The stream: its banks, the drifting shimmer, the glowing lights at night,
   the heart droplets that flow out past the cabin, and the dirt footpaths
   leading to the doors. */

export const STREAM_LIGHT_PATH = "M20 86 C120 78 200 92 310 84 C420 76 500 88 620 76 C720 66 800 72 900 62 C990 54 1080 60 1180 50";

export const STREAM_LIGHTS = Array.from({ length: 12 }, (_, i) => ({
  r: 9 + (i % 3) * 2.5,
  dur: 16 + (i % 5) * 2.5,
  frac: i / 12,
}));

export const STREAM_STATIC_POINTS = [[60, 84], [180, 88], [300, 82], [420, 86], [540, 78], [660, 72], [780, 70], [900, 62], [1020, 60], [1140, 52]];

/* Heart droplets: they well up where the stream passes the cabin (~x840 in
   the river's own 1200-wide coordinates) and ride the current from there,
   fading in and out so they read as part of the shimmer rather than as
   fixed shapes sitting on the water. */

export const HEART_STREAM_PATH = "M842 64 C880 61 920 58 962 56 C1008 53 1054 58 1102 54 C1140 51 1170 49 1200 47";

export const HEART_DROP_D = "M0 4 C-4.6 0.8 -5.6 -2.2 -3.4 -3.8 C-1.8 -5 -0.4 -4 0 -3 C0.4 -4 1.8 -5 3.4 -3.8 C5.6 -2.2 4.6 0.8 0 4 Z";

export const STREAM_HEARTS = Array.from({ length: 10 }, (_, i) => ({
  dur: 11 + (i % 4) * 2.5,
  frac: i / 10,
  scale: 0.5 + (i % 3) * 0.16,
  tone: ["#f7b8ce", "#fbd3e0", "#f4a6c2", "#ffe3ec"][i % 4],
  op: 0.55 + (i % 3) * 0.12,
  bob: 1.8 + (i % 3) * 0.7,
}));

export const STREAM_HEART_STATIC = [[900, 60], [1010, 57], [1120, 52]];

export const River = ({ night = false }) => {
  const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
  <svg style={{ width: "100%", height: "auto", display: "block" }} viewBox="0 0 1200 150" aria-hidden="true">
    {/* water ribbon, meandering edge to edge */}
    <path d="M0 70 C90 62 170 84 270 74 C370 64 450 82 560 70 C670 58 740 70 840 58 C930 48 1030 62 1130 50 C1156 47 1180 45 1200 44
             L1200 64 C1176 66 1152 68 1126 70 C1028 82 934 70 846 80 C748 92 676 80 566 92 C458 102 372 86 274 96 C176 106 92 84 0 104 Z"
      fill="#8ec3de" stroke="#5f93b8" strokeWidth="2.6" strokeLinejoin="round" />
    {/* lighter inner current */}
    <path d="M0 80 C94 72 174 90 274 82 C374 72 454 88 566 78 C674 68 744 76 848 66 C936 58 1034 68 1132 58 C1158 55 1182 53 1200 52
             L1200 57 C1180 58 1158 60 1134 63 C1036 74 938 64 850 73 C748 84 678 74 568 84 C460 94 376 80 276 88 C178 96 96 80 0 92 Z"
      fill="#b8ddf0" opacity=".85" />
    {/* long flow streaks along the length */}
    <path className="ripple" style={{ animationDuration: "5.4s" }}
      d="M20 86 C120 78 200 92 310 84 C420 76 500 88 620 76 C720 66 800 72 900 62 C990 54 1080 60 1180 50"
      stroke="#eaf6fc" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".75" />
    <path d="M60 94 C160 88 250 98 370 90 C480 82 560 90 680 80 C770 72 860 76 960 66 C1040 60 1120 62 1190 56"
      stroke="#d7edf8" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".6" />
    <path className="ripple" style={{ animationDuration: "6.2s", animationDelay: "-2.8s" }}
      d="M140 78 C240 72 330 84 450 76 C560 68 650 74 770 64 C860 56 950 60 1060 52"
      stroke="#f4fbff" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".55" />
    {/* drifting shimmer ripples */}
    {[
      { d: "M90 81 q10 4 20 0", dur: "3.4s", del: "0s", w: 2.6 },
      { d: "M240 85 q10 4 20 0", dur: "3.9s", del: "-1.5s", w: 2.4 },
      { d: "M400 81 q9 3.5 18 0", dur: "3.2s", del: "-2.4s", w: 2.4 },
      { d: "M540 81 q9 3.5 18 0", dur: "4s", del: "-0.8s", w: 2.2 },
      { d: "M700 73 q9 3.5 18 0", dur: "3.6s", del: "-2.9s", w: 2.2 },
      { d: "M860 65 q8 3 16 0", dur: "3.8s", del: "-1.1s", w: 2.2 },
      { d: "M1000 63 q8 3 16 0", dur: "3.5s", del: "-2s", w: 2 },
      { d: "M1120 59 q7 2.6 14 0", dur: "4.1s", del: "-0.5s", w: 2 },
    ].map((r, i) => (
      <g key={i} className="ripple" style={{ animationDuration: r.dur, animationDelay: r.del }}>
        <path d={r.d} stroke="#eaf6fc" strokeWidth={r.w} fill="none" strokeLinecap="round" />
      </g>
    ))}
    {/* heart droplets welling up by the cabin and drifting off on the current */}
    {reduced ? (
      STREAM_HEART_STATIC.map(([x, y], i) => (
        <path key={i} d={HEART_DROP_D} fill="#f7b8ce" opacity=".55"
          transform={`translate(${x} ${y}) scale(0.6)`} />
      ))
    ) : (
      STREAM_HEARTS.map((h, i) => (
        <g key={i} opacity="0">
          <g>
            <path d={HEART_DROP_D} fill={h.tone} opacity={h.op} transform={`scale(${h.scale})`} />
            {/* small vertical bob so they bounce with the water, not glide flat */}
            <animateTransform attributeName="transform" type="translate"
              values={`0 0; 0 ${-h.bob}; 0 0; 0 ${h.bob}; 0 0`}
              dur={`${2.2 + (i % 3) * 0.6}s`} repeatCount="indefinite" />
          </g>
          <animateMotion dur={`${h.dur}s`} begin={`${-h.frac * h.dur}s`}
            repeatCount="indefinite" path={HEART_STREAM_PATH} />
          <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.12;0.7;1"
            dur={`${h.dur}s`} begin={`${-h.frac * h.dur}s`} repeatCount="indefinite" />
        </g>
      ))
    )}

    {/* pebbled banks */}
    <circle cx="70" cy="66" r="3.4" fill="#c9b89a" stroke="#a8977a" strokeWidth="1.2" />
    <circle cx="220" cy="100" r="3" fill="#d6c6a8" stroke="#a8977a" strokeWidth="1.2" />
    <circle cx="380" cy="68" r="3.2" fill="#c9b89a" stroke="#a8977a" strokeWidth="1.2" />
    <circle cx="520" cy="96" r="3.4" fill="#d6c6a8" stroke="#a8977a" strokeWidth="1.2" />
    <circle cx="660" cy="62" r="2.8" fill="#c9b89a" stroke="#a8977a" strokeWidth="1.2" />
    <circle cx="800" cy="86" r="3" fill="#d6c6a8" stroke="#a8977a" strokeWidth="1.2" />
    <circle cx="940" cy="52" r="2.8" fill="#c9b89a" stroke="#a8977a" strokeWidth="1.2" />
    <circle cx="1060" cy="72" r="3" fill="#d6c6a8" stroke="#a8977a" strokeWidth="1.2" />
    <circle cx="1160" cy="48" r="2.6" fill="#c9b89a" stroke="#a8977a" strokeWidth="1.2" />



    {/* glowing blue lights riding the current at night */}
    {night && (
      <g>
        <defs>
          <radialGradient id="streamGlow">
            <stop offset="0%" stopColor="rgba(220,246,255,.95)" />
            <stop offset="45%" stopColor="rgba(143,216,240,.55)" />
            <stop offset="100%" stopColor="rgba(143,216,240,0)" />
          </radialGradient>
        </defs>
        {reduced
          ? STREAM_STATIC_POINTS.map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`} opacity=".9">
                <circle r={10} fill="url(#streamGlow)" />
                <circle r="2.4" fill="#eaf9ff" />
              </g>
            ))
          : STREAM_LIGHTS.map((L, i) => (
              <g key={i} opacity=".9">
                <circle r={L.r} fill="url(#streamGlow)" />
                <circle r="2.4" fill="#eaf9ff" />
                <animateMotion dur={`${L.dur}s`} begin={`${-L.frac * L.dur}s`} repeatCount="indefinite" path={STREAM_LIGHT_PATH} />
              </g>
            ))}
      </g>
    )}
  </svg>
  );
};

/* Dirt footpaths: tapered winding trails in storybook style */

export const CottageTrail = () => (
  <svg
    width="56"
    style={{ display: "block", height: "calc(16.5vh - 6.46vw + 14px)", minHeight: 56 }}
    viewBox="0 0 56 100"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path d="M24 0 C18 22 34 38 24 58 C16 74 32 86 22 100 L40 100 C48 86 30 74 38 58 C46 38 28 22 32 0 Z"
      fill="#d9b98c" stroke="#a8875c" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    <ellipse cx="26" cy="24" rx="3" ry="1.8" fill="#c7a877" />
    <ellipse cx="30" cy="52" rx="3.2" ry="1.9" fill="#c7a877" />
    <ellipse cx="27" cy="80" rx="3.4" ry="2" fill="#c7a877" />
  </svg>
);

export const CabinTrail = () => (
  <svg
    width="150"
    style={{ display: "block", height: "calc(5.5vh + 14px)", minHeight: 66 }}
    viewBox="0 0 150 85"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path d="M88 0 C70 18 110 34 84 50 C62 64 96 74 70 85 L108 85 C126 72 96 62 114 48 C132 32 96 20 102 0 Z"
      fill="#d9b98c" stroke="#b99a6d" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    <ellipse cx="93" cy="18" rx="3.6" ry="2.3" fill="#c7a877" />
    <ellipse cx="98" cy="44" rx="3.8" ry="2.4" fill="#c7a877" />
    <ellipse cx="90" cy="68" rx="3.6" ry="2.3" fill="#c7a877" />
  </svg>
);
