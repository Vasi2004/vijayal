/* styles.jsx
   Every bit of CSS for the whole site: colours, fonts, buttons, panels, and
   all the keyframe animations (swaying, drifting, glowing, twinkling).
   Change anything about how the site *looks* in general here. */

export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Caveat:wght@400;600;700&display=swap');

    :root {
      --sky-top: #aee0f2;
      --sky-bottom: #e9f7fb;
      --grass: #8fbf6f;
      --grass-deep: #6ca24f;
      --cream: #fff9ec;
      --paper: #fffdf6;
      --beige: #f0e6d2;
      --brown: #8b6f47;
      --brown-deep: #6b5335;
      --yellow: #f5d76e;
      --aqua: #6fc7bd;
      --aqua-deep: #45a89c;
      --purple: #b39ddb;
      --pink: #f3a5b5;
      --blossom: #f8c8d8;
      --blossom-deep: #ef93ae;
      --ink: #4a3b28;
    }

    .us-root {
      font-family: 'Baloo 2', 'Quicksand', 'Comic Sans MS', system-ui, sans-serif;
      color: var(--ink);
    }
    .hand {
      font-family: 'Caveat', 'Segoe Script', 'Brush Script MT', cursive, serif;
    }

    .content-frame {
      background: rgba(255, 249, 236, .42);
      border: 3px solid rgba(226, 207, 192, .9);
      border-radius: 34px;
      box-shadow: 0 12px 34px rgba(107, 83, 53, 0.18), 0 6px 40px rgba(239, 147, 174, 0.16);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      padding: 26px 22px 40px;
      pointer-events: auto;
    }
    @media (max-width: 700px) {
      .content-frame { padding: 18px 12px 28px; border-radius: 26px; }
    }

    .panel {
      background: var(--cream);
      border: 3px solid #e8cfc0;
      border-radius: 28px;
      box-shadow: 0 8px 24px rgba(107, 83, 53, 0.14), 0 4px 30px rgba(239, 147, 174, 0.16);
    }

    .btn {
      font-family: inherit;
      font-weight: 700;
      border-radius: 999px;
      border: 3px solid var(--brown);
      padding: 8px 20px;
      cursor: pointer;
      transition: transform .12s ease, box-shadow .12s ease;
      box-shadow: 0 3px 0 var(--brown);
    }
    .btn:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--brown); }
    .btn:focus-visible { outline: 3px solid var(--aqua-deep); outline-offset: 2px; }
    .btn-green { background: var(--grass); color: #2f4a1f; }
    .btn-yellow { background: var(--yellow); color: #6b5335; }
    .btn-aqua { background: var(--aqua); color: #144d45; }
    .btn-plain { background: var(--beige); color: var(--brown-deep); }
    .btn-pink { background: var(--blossom); color: #8a3b55; }
    .btn-red { background: #ef8b8b; color: #6e2424; }

    .field {
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
      background: var(--paper);
      border: 3px solid #e2d3b3;
      border-radius: 16px;
      padding: 10px 14px;
      font-size: 16px;
      color: var(--ink);
    }
    .field:focus { outline: 3px solid var(--aqua); outline-offset: 1px; }
    textarea.field { resize: vertical; min-height: 90px; line-height: 1.5; }

    /* ---------- ambient animations ---------- */
    @keyframes drift {
      /* measured in viewport units, so a cloud always crosses the whole sky
         no matter how wide the window is */
      from { transform: translateX(-22vw); }
      to   { transform: translateX(122vw); }
    }
    @keyframes sway {
      0%, 100% { transform: rotate(-7deg); }
      50%      { transform: rotate(8deg); }
    }
    @keyframes swaySoft {
      0%, 100% { transform: rotate(-2.5deg); }
      50%      { transform: rotate(3deg); }
    }
    @keyframes grassSway {
      0%, 100% { transform: skewX(-8deg); }
      50%      { transform: skewX(9deg); }
    }
    @keyframes breathe {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.07); }
    }
    @keyframes earTwitch {
      0%, 88%, 100% { transform: rotate(0deg); }
      92% { transform: rotate(-11deg); }
      96% { transform: rotate(5deg); }
    }
    @keyframes petalFall {
      0%   { transform: translateY(-6vh) translateX(0) rotate(0deg); opacity: 0; }
      8%   { opacity: .95; }
      50%  { transform: translateY(48vh) translateX(6vw) rotate(200deg); }
      92%  { opacity: .9; }
      100% { transform: translateY(106vh) translateX(-3vw) rotate(400deg); opacity: 0; }
    }
    @keyframes petalFallB {
      0%   { transform: translateY(-6vh) translateX(0) rotate(0deg); opacity: 0; }
      8%   { opacity: .9; }
      50%  { transform: translateY(50vh) translateX(-6vw) rotate(-190deg); }
      92%  { opacity: .85; }
      100% { transform: translateY(106vh) translateX(4vw) rotate(-380deg); opacity: 0; }
    }
    @keyframes heartFloat {
      0%   { transform: translateY(0) translateX(0) scale(.9); opacity: 0; }
      12%  { opacity: .6; }
      50%  { transform: translateY(-38vh) translateX(2.5vw) scale(1); opacity: .55; }
      88%  { opacity: .35; }
      100% { transform: translateY(-78vh) translateX(-1.5vw) scale(1.08); opacity: 0; }
    }
    @keyframes leafFall {
      0%   { transform: translateY(-6vh) translateX(0) rotate(0deg); opacity: 0; }
      10%  { opacity: .85; }
      35%  { transform: translateY(28vh) translateX(-4vw) rotate(60deg); }
      65%  { transform: translateY(64vh) translateX(4vw) rotate(-40deg); }
      90%  { opacity: .8; }
      100% { transform: translateY(106vh) translateX(-2vw) rotate(100deg); opacity: 0; }
    }
    @keyframes glowPulse {
      0%, 100% { opacity: .55; }
      50%      { opacity: .95; }
    }
    @keyframes burstOut {
      0%   { transform: translate(0, 0) scale(.3); opacity: 0; }
      12%  { opacity: 1; }
      70%  { opacity: .9; }
      100% { transform: translate(var(--bx), var(--by)) scale(1); opacity: 0; }
    }
    @keyframes letterOpen {
      from { opacity: 0; transform: scaleY(.6) translateY(-8px); }
      to   { opacity: 1; transform: scaleY(1) translateY(0); }
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(.94); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes cdSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes orbitSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes counterSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(-360deg); }
    }
    @keyframes ripDrift {
      0%   { transform: translateX(-22px); opacity: 0; }
      20%  { opacity: .9; }
      80%  { opacity: .9; }
      100% { transform: translateX(24px); opacity: 0; }
    }
    @keyframes twinkle {
      0%, 100% { opacity: .25; transform: scale(.85); }
      50%      { opacity: 1; transform: scale(1.15); }
    }
    @keyframes shootStreak {
      0%   { transform: translate(0, 0); opacity: 0; }
      10%  { opacity: 1; }
      75%  { opacity: 1; }
      100% { transform: translate(-42vw, 26vh); opacity: 0; }
    }
    .cloud { animation: drift linear infinite; }
    .swayer { transform-origin: bottom center; animation: sway ease-in-out infinite; }
    .swayer-soft { transform-origin: bottom center; animation: swaySoft ease-in-out infinite; }
    .grass-tuft { transform-origin: bottom center; animation: grassSway ease-in-out infinite; }
    .breather { transform-origin: bottom center; animation: breathe 4s ease-in-out infinite; }
    .ear { transform-origin: bottom center; animation: earTwitch 6s ease-in-out infinite; }
    .petal { position: absolute; top: 0; animation: petalFall linear infinite; will-change: transform; }
    .petal-b { animation-name: petalFallB; }
    .leaf-fall { position: absolute; top: 0; animation: leafFall linear infinite; will-change: transform; }
    .float-heart { position: absolute; bottom: -4vh; animation: heartFloat ease-in-out infinite; will-change: transform; }
    .lantern-glow { animation: glowPulse 3.4s ease-in-out infinite; }
    .burst-heart { position: absolute; left: 0; top: 0; animation: burstOut 1.55s cubic-bezier(.15,.65,.35,1) forwards; will-change: transform; }
    .letter-open { animation: letterOpen .28s ease-out; transform-origin: top center; }
    .pop-in { animation: popIn .22s ease-out; }
    .cd-spinning { animation: cdSpin 4s linear infinite; }
    .orbiter { animation: orbitSpin 42s linear infinite; }
    .orbit-item { animation: counterSpin 42s linear infinite; }
    .twinkle-star { animation: twinkle ease-in-out infinite; }
    .ripple { animation: ripDrift linear infinite; }
    .shoot-move { animation: shootStreak ease-out forwards; will-change: transform; }

    .ambient-widget { position: fixed; z-index: 1; opacity: .85; }
    @media (max-width: 700px) {
      .ambient-widget { transform: scale(.42); }
      .widget-left { transform-origin: left center; }
      .widget-right { transform-origin: right center; }
    }

    /* GSAP takes over these when loaded; CSS keyframes stay as fallback */
    .gsap-on .swayer, .gsap-on .swayer-soft, .gsap-on .grass-tuft,
    .gsap-on .breather, .gsap-on .petal, .gsap-on .float-heart, .gsap-on .leaf-fall, .gsap-on .cd-spinning,
    .gsap-on .orbiter, .gsap-on .orbit-item, .gsap-on .burst-heart { animation: none !important; }

    .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }

    .excl {
      position: absolute;
      left: 50%;
      margin-left: -13px;
      top: -46px;
      width: 26px;
      opacity: 0;
      transition: opacity .15s ease;
      pointer-events: none;
      text-align: center;
      font-family: 'Baloo 2', sans-serif;
      font-weight: 900;
      font-size: 28px;
      line-height: 1;
      color: #e6303a;
      text-shadow: 2px 0 0 #7a1015, -2px 0 0 #7a1015, 0 2px 0 #7a1015, 0 -2px 0 #7a1015, 0 3px 5px rgba(0,0,0,.35);
      z-index: 5;
    }

    @keyframes heartBeatSmall {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.2); }
    }
    .hug-heart { animation: heartBeatSmall 1s ease-in-out infinite; }

    .side-scenery { display: block; }
    @media (max-width: 900px) {
      .side-scenery { display: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      .cloud, .swayer, .swayer-soft, .grass-tuft, .breather, .ear,
      .lantern-glow, .letter-open, .pop-in, .cd-spinning, .orbiter,
      .orbit-item, .twinkle-star, .ripple {
        animation: none !important;
      }
      .twinkle-star { opacity: .8; }
      .petal, .float-heart, .burst-heart, .shoot-move, .leaf-fall { display: none !important; }
    }
  `}</style>
);

/* ===================== Storage helpers ===================== */
/* All site content is shared so both of you see the same data
   on any device. Login state is session only (in memory).     */
