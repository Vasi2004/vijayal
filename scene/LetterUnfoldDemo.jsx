import { useRef, useEffect, useState, useMemo } from "react";
import { LETTER_THEMES, petalTypesFor } from "./letterThemes.js";
import { PhotoFrame } from "./letterPhotos.jsx";

const rand = (a, b) => a + Math.random() * (b - a);

/* The uploaded reveal, ported to React with content and behaviour otherwise
   unchanged. The only functional difference from the source file: it takes
   a letter (or null) and an onClose callback instead of owning its own
   "open the letter" demo button, so it opens when a real letter is clicked
   elsewhere in the site. */
export function LetterUnfoldDemo({ letter, onClose }) {
  const sheetRef = useRef(null);
  const letterTextRef = useRef(null);
  const petalFieldRef = useRef(null);
  const bubbleFieldRef = useRef(null);

  const themeKey = (letter && letter.theme) || "rose";
  const theme = LETTER_THEMES[themeKey] || LETTER_THEMES.rose;
  const petalTypes = useMemo(() => petalTypesFor(themeKey), [themeKey]);

  const [pageClass, setPageClass] = useState("");
  const [sheetClass, setSheetClass] = useState("folded");
  const [burst, setBurst] = useState(false);
  const timers = useRef([]);

  const generatedPetals = useMemo(() => {
    const COUNT = 180;
    return Array.from({ length: COUNT }).map((_, i) => {
      const isFar = Math.random() < 0.38;
      const typeIdx = Math.floor(Math.random() * petalTypes.length);
      const type = petalTypes[typeIdx];
      let baseSize = rand(type.sizeRange[0], type.sizeRange[1]);
      const size = isFar ? baseSize * 0.55 : baseSize;

      const burstDelay = rand(0, 300);
      const floatDur = rand(type.floatDurRange[0], type.floatDurRange[1]);
      const spread = (isFar ? 0.7 : 1.3);

      return {
        id: i,
        className: "petal" + (isFar ? " far" : ""),
        url: type.url,
        style: {
          left: rand(-20, 120) + "%",
          width: size + "px",
          height: size + "px",
          "--rise": rand(-90, 15) + "vh",
          "--drift": rand(-450, 450) + "px",
          "--depth": rand(-100, 100) + "px",
          "--rest-opacity": (isFar ? rand(0.35, type.restOp[0]) : rand(type.restOp[0], type.restOp[1])).toFixed(2),
          "--rx": rand(-18, 18) + "deg",
          "--ry": rand(-22, 22) + "deg",
          "--rz": rand(-30, 30) + "deg",
          "--burst-delay": burstDelay + "ms",
          "--float-dur": floatDur + "s",
          "--burst-dur": (floatDur * 0.3) + "s",
          "--p1x": rand(-120, 120) * spread + "px",
          "--p1y": -rand(40, 120) * spread + "px",
          "--p2x": rand(-180, 180) * spread + "px",
          "--p2y": -rand(70, 160) * spread + "px",
          "--op1": rand(0.82, 0.98).toFixed(2),
          "--op2": 1,
          filter: (!isFar && type.shadow && size > 45) ? `drop-shadow(0 0 ${Math.round(size * 0.16)}px rgba(${theme.glow},0.3))` : "none"
        }
      };
    });
  }, [petalTypes, theme.glow]);

  const generatedBubbles = useMemo(() => {
    const BUBBLE_COUNT = 60;
    return Array.from({ length: BUBBLE_COUNT }).map((_, i) => {
      const size = rand(15, 50);
      const floatDur = rand(6, 14);
      return {
        id: i,
        style: {
          left: rand(-10, 110) + "%",
          width: size + "px",
          height: size + "px",
          "--b-rise": rand(-135, -15) + "vh",
          "--b-drift": rand(-350, 350) + "px",
          "--b-depth": rand(-60, 60) + "px",
          "--b-rest-opacity": rand(0.2, 0.55).toFixed(2),
          "--bubble-burst-delay": rand(0, 400) + "ms",
          "--bubble-float-dur": floatDur + "s",
          "--bubble-burst-dur": (floatDur * 0.35) + "s",
          "--bx": rand(-50, 50) + "px",
          "--by": rand(-40, 40) + "px",
        }
      };
    });
  }, []);

  const autoScaleText = () => {
    if (!letterTextRef.current || !sheetRef.current) return;
    const sheetWidth = sheetRef.current.clientWidth || window.innerWidth * 0.4;
    let fontSize = Math.min(Math.max(sheetWidth * 0.055, 18), 34);
    letterTextRef.current.style.fontSize = fontSize + "px";

    while (
      (letterTextRef.current.scrollHeight > letterTextRef.current.clientHeight || letterTextRef.current.scrollWidth > letterTextRef.current.clientWidth)
      && fontSize > 14
    ) {
      fontSize -= 0.5;
      letterTextRef.current.style.fontSize = fontSize + "px";
    }
  };

  useEffect(() => {
    window.addEventListener("resize", autoScaleText);
    return () => window.removeEventListener("resize", autoScaleText);
  }, []);

  const openLetter = () => {
    setPageClass("show");

    timers.current.push(setTimeout(() => {
      setBurst(true);
    }, 350));

    timers.current.push(setTimeout(() => {
      setPageClass("show show-letter");
      autoScaleText();
    }, 750));

    timers.current.push(setTimeout(() => {
      setSheetClass("unfolding");
      autoScaleText();
    }, 1300));

    timers.current.push(setTimeout(() => {
      setSheetClass("open");
      autoScaleText();
    }, 1750));
  };

  const reset = () => {
    setPageClass("closing");

    timers.current.push(setTimeout(() => {
      setPageClass("");
      setBurst(false);
      setSheetClass("folded");
      if (onClose) onClose();
    }, 1400));
  };

  /* opens itself the moment a real letter is handed to it -- this is the
     one behavioural difference from the uploaded version's own button */
  useEffect(() => {
    if (letter) openLetter();
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter]);

  if (!letter && pageClass === "") return null;

  return (
    <>
      <style>{`
        .lud-root {
          --parchment: #f4ecd8;
          --parchment-shadow: #e2d4b4;
          --ink: #36281e;
          --sheet-w: min(92vw, 67.5vh);
        }

        /* ---------- pink page container (drops down from the very top) ---------- */
        .lud-page {
          position: fixed; inset: 0;
          background: linear-gradient(160deg, var(--pink) 0%, var(--pink-deep) 100%);
          display: flex; align-items: center; justify-content: center;
          z-index: 90;
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
          overflow: hidden;
          transition: transform 900ms cubic-bezier(.4, 0, .2, 1), opacity 700ms ease;
        }
        .lud-page.show {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        .lud-page.closing {
          transform: translateY(-100%);
          opacity: 0;
          transition: transform 900ms cubic-bezier(.4, 0, .2, 1) 300ms, opacity 700ms ease 300ms;
        }

        .lud-close-btn {
          position: absolute; top: 22px; right: 26px; z-index: 10;
          width: 38px; height: 38px; padding: 0;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 16px;
          opacity: 0; transition: opacity 400ms ease;
        }
        .lud-page.show .lud-close-btn { opacity: 1; }

        /* ---------- petals field with 3D perspective ---------- */
        .lud-petal-field {
          position: absolute; inset: 0; pointer-events: none;
          perspective: 1000px;
        }
        .lud-page.closing .lud-petal-field {
          opacity: 0;
          transition: opacity 500ms ease 400ms;
        }

        .lud-petal {
          position: absolute; bottom: -40px; opacity: 0;
          will-change: transform;
          transform-style: preserve-3d;
        }
        .lud-petal-asset {
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          position: absolute; inset: 0;
          backface-visibility: visible;
        }

        .lud-petal-field.burst .lud-petal {
          animation:
            ludPetalBurst var(--burst-dur, 3.5s) var(--burst-delay, 0s) cubic-bezier(0.1, 0.6, 0.3, 1) forwards,
            ludPetalSway var(--float-dur, 12s) ease-in-out infinite;
          animation-delay: var(--burst-delay, 0s), calc(var(--burst-delay, 0s) + var(--burst-dur, 3.5s));
        }

        @keyframes ludPetalBurst {
          0% {
            transform: translate3d(0, 0, 0) scale(0.4) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--drift), var(--rise), var(--depth, 0px)) scale(1) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz));
            opacity: var(--rest-opacity, .9);
          }
        }

        @keyframes ludPetalSway {
          0%, 100% {
            transform: translate3d(var(--drift), var(--rise), var(--depth, 0px)) scale(1) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz));
            opacity: var(--rest-opacity, .9);
          }
          33% {
            transform: translate3d(calc(var(--drift) + var(--p1x)), calc(var(--rise) + var(--p1y)), calc(var(--depth) + 25px)) scale(1) rotateX(calc(var(--rx) + 20deg)) rotateY(calc(var(--ry) - 25deg)) rotateZ(calc(var(--rz) + 30deg));
            opacity: var(--op1);
          }
          66% {
            transform: translate3d(calc(var(--drift) + var(--p2x)), calc(var(--rise) + var(--p2y)), calc(var(--depth) - 25px)) scale(1) rotateX(calc(var(--rx) - 20deg)) rotateY(calc(var(--ry) + 25deg)) rotateZ(calc(var(--rz) - 30deg));
            opacity: var(--op2);
          }
        }

        .lud-petal.far { filter: blur(1.5px); }

        /* ---------- realistic pink bubbles (see-through & extended higher) ---------- */
        .lud-bubble-field {
          position: absolute; inset: 0; pointer-events: none;
          perspective: 1000px;
          z-index: 4;
        }
        .lud-page.closing .lud-bubble-field {
          opacity: 0;
          transition: opacity 500ms ease 400ms;
        }
        .lud-bubble {
          position: absolute; bottom: -50px; opacity: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, rgba(var(--bubble-mid),0.2) 40%, rgba(var(--bubble-outer),0.1) 75%, rgba(var(--bubble-edge),0.05) 100%);
          box-shadow: inset 0 0 10px rgba(255,255,255,0.5), inset 2px 2px 4px rgba(255,255,255,0.6), 0 4px 15px rgba(var(--bubble-shadow),0.15);
          border: 1px solid rgba(255, 255, 255, 0.4);
          will-change: transform;
        }
        .lud-bubble::after {
          content: '';
          position: absolute;
          top: 15%;
          left: 18%;
          width: 26%;
          height: 26%;
          background: rgba(255, 255, 255, 0.65);
          border-radius: 50%;
          filter: blur(0.5px);
        }
        .lud-bubble::before {
          content: '';
          position: absolute;
          top: 32%;
          left: 10%;
          width: 12%;
          height: 12%;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
        }
        .lud-bubble-field.burst .lud-bubble {
          animation:
            ludBubbleBurst var(--bubble-burst-dur, 4s) var(--bubble-burst-delay, 0s) cubic-bezier(0.1, 0.6, 0.3, 1) forwards,
            ludBubbleSway var(--bubble-float-dur, 10s) ease-in-out infinite;
          animation-delay: var(--bubble-burst-delay, 0s), calc(var(--bubble-burst-delay, 0s) + var(--bubble-burst-dur, 4s));
        }
        @keyframes ludBubbleBurst {
          0% {
            transform: translate3d(0, 0, 0) scale(0.3);
            opacity: 0;
          }
          30% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(var(--b-drift), var(--b-rise), var(--b-depth, 0px)) scale(1);
            opacity: var(--b-rest-opacity, 0.5);
          }
        }
        @keyframes ludBubbleSway {
          0%, 100% {
            transform: translate3d(var(--b-drift), var(--b-rise), var(--b-depth, 0px)) scale(1);
            opacity: var(--b-rest-opacity, 0.5);
          }
          50% {
            transform: translate3d(calc(var(--b-drift) + var(--bx)), calc(var(--b-rise) + var(--by)), calc(var(--b-depth) + 25px)) scale(1.06);
            opacity: calc(var(--b-rest-opacity, 0.5) * 1.1);
          }
        }

        /* ---------- letter wrapper ---------- */
        .lud-letter-wrap {
          position: relative;
          transform: translateY(140vh) scale(.94);
          opacity: 0;
          transition: transform 900ms cubic-bezier(.2,.85,.32,1.15), opacity 500ms ease;
          transform-style: preserve-3d;
        }
        .lud-page.show-letter .lud-letter-wrap {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        .lud-page.closing .lud-letter-wrap {
          transform: translateY(-120vh) scale(.94);
          opacity: 0;
          transition: transform 700ms cubic-bezier(0.4, 0, 0.7, 1), opacity 500ms ease;
        }

        /* ---------- envelope ---------- */
        .lud-envelope {
          position: absolute;
          bottom: -2%;
          right: -38%;
          width: calc(var(--sheet-w) * 0.65);
          aspect-ratio: 1.35 / 1;
          transform: rotate(14deg) translateZ(-60px);
          transform-style: preserve-3d;
          filter: drop-shadow(0 18px 28px rgba(100, 60, 80, 0.22));
        }
        .lud-env-back {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #ffffff, #f2e8ec);
          border-radius: 3px;
        }
        .lud-env-inner-shadow {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(80,50,65,0.12) 0%, transparent 40%);
          clip-path: polygon(0 0, 50% 48%, 100% 0, 100% 100%, 0 100%);
        }
        .lud-env-flap-open {
          position: absolute; top: -1px; left: 0; right: 0; height: 58%;
          background: linear-gradient(180deg, #ffffff, #fbf7f8);
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          transform-origin: top;
          transform: rotateX(180deg);
          border-radius: 2px;
          box-shadow: inset 0 -3px 8px rgba(0,0,0,0.04);
        }
        .lud-env-pocket {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom right, #ffffff, #f7f2f4);
          clip-path: polygon(0 0, 50% 48%, 100% 0, 100% 100%, 0 100%);
          border-radius: 3px;
        }
        .lud-env-side-flaps {
          position: absolute; inset: 0;
          background: linear-gradient(to right, #ffffff 0%, #fcf8fa 50%, #f4ebf0 100%);
          clip-path: polygon(0 0, 48% 46%, 0 100%, 100% 100%, 52% 46%, 100% 0);
        }

        /* ---------- letter paper ---------- */
        .lud-sheet {
          position: relative;
          width: var(--sheet-w);
          aspect-ratio: 3 / 4;
          filter: drop-shadow(0 22px 34px rgba(120,70,90,.26));
          transform-style: preserve-3d;
        }

        .lud-panel {
          position: absolute; left: 0; width: 100%;
          background:
            repeating-linear-gradient(89deg, rgba(120,95,55,.04) 0px, transparent 1px, transparent 3px),
            repeating-linear-gradient(1deg, rgba(120,95,55,.03) 0px, transparent 1px, transparent 4px),
            radial-gradient(ellipse 45% 22% at 85% 10%, rgba(190,155,95,.18), transparent 60%),
            radial-gradient(ellipse 50% 24% at 10% 94%, rgba(175,140,85,.14), transparent 60%),
            linear-gradient(135deg, var(--parchment) 0%, #efe3c6 55%, var(--parchment) 100%);
          border-left: 1px solid var(--parchment-shadow);
          border-right: 1px solid var(--parchment-shadow);
          overflow: hidden;
          backface-visibility: hidden;
          box-shadow: inset 0 0 25px rgba(140,105,60,.16);
        }

        .lud-panel-top {
          top: 0; height: 33.334%; transform-origin: bottom center;
          clip-path: polygon(
            0% 3px, 3% 1px, 7% 4px, 12% 1px, 16% 3px, 22% 0px, 28% 3px, 34% 1px,
            40% 4px, 47% 1px, 53% 3px, 59% 0px, 66% 3px, 72% 1px, 78% 4px, 85% 1px,
            91% 3px, 96% 0px, 100% 3px, 100% 100%, 0% 100%
          );
          filter: url(#lud-paper-tear-filter);
        }

        .lud-panel-mid { top: 33.334%; height: 33.334%; z-index: 2; }

        .lud-panel-bottom {
          top: 66.667%; height: 33.334%; transform-origin: top center;
          clip-path: polygon(
            0% 0%, 100% 0%, 100% calc(100% - 3px), 96% calc(100% - 1px), 91% calc(100% - 4px),
            85% calc(100% - 1px), 78% calc(100% - 3px), 72% calc(100% - 0px), 66% calc(100% - 3px),
            59% calc(100% - 1px), 53% calc(100% - 4px), 47% calc(100% - 1px), 40% calc(100% - 3px),
            34% calc(100% - 0px), 28% calc(100% - 3px), 22% calc(100% - 1px), 16% calc(100% - 4px),
            12% calc(100% - 1px), 7% calc(100% - 3px), 0% calc(100% - 2px)
          );
          filter: url(#lud-paper-tear-filter);
        }

        .lud-sheet.folded .lud-panel-top    { transform: rotateX(-178deg) translateZ(-1px); }
        .lud-sheet.folded .lud-panel-bottom { transform: rotateX(178deg) translateZ(-1px); }

        .lud-sheet.unfolding .lud-panel-top {
          transition: transform 900ms cubic-bezier(.4,0,.2,1) 50ms;
          transform: rotateX(0deg) rotate(-0.35deg);
        }
        .lud-sheet.unfolding .lud-panel-bottom {
          transition: transform 900ms cubic-bezier(.4,0,.2,1) 250ms;
          transform: rotateX(0deg) rotate(0.3deg);
        }

        .lud-fold-shadow {
          position: absolute; left: 6%; right: 6%; height: 5.5%;
          background: radial-gradient(ellipse, rgba(120,90,60,.20), transparent 70%);
          opacity: 0; transition: opacity 700ms ease;
          pointer-events: none;
        }
        .lud-fold-shadow.top    { top: 33.334%; }
        .lud-fold-shadow.bottom { top: 61%; }
        .lud-sheet.folded .lud-fold-shadow { opacity: 1; }

        .lud-letter-face {
          position: absolute; inset: 0; pointer-events: none;
          z-index: 3;
        }

        .lud-crease { position: absolute; left: 4%; right: 4%; height: 1.2%; opacity: 0; transition: opacity 500ms ease 600ms; }
        .lud-crease-1 { top: 32.8%; background: linear-gradient(180deg, rgba(120,90,55,.16), transparent); }
        .lud-crease-2 { top: 66.2%; background: linear-gradient(0deg, rgba(120,90,55,.16), transparent); }
        .lud-sheet.open ~ .lud-letter-face .lud-crease { opacity: 1; }

        /* Natural text flow preventing giant gaps at the bottom */
        .lud-letter-text {
          position: absolute; inset: 0;
          padding: 10% 11% 8%;
          font-family: 'Caveat', cursive;
          font-weight: 500;
          line-height: 1.35;
          color: var(--ink);
          opacity: 0; transform: translateY(6px);
          transition: opacity 800ms ease 400ms, transform 800ms ease 400ms;
          display: flex; flex-direction: column; justify-content: flex-start; gap: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }
        .lud-sheet.open ~ .lud-letter-face .lud-letter-text { opacity: 1; transform: translateY(0); }
        .lud-letter-text .lud-body-content {
          margin-top: 4px;
          letter-spacing: 0.5px;
          white-space: pre-wrap;
        }
        .lud-letter-text .lud-sign-off {
          display: block;
          font-size: 1.1em;
        }
        .lud-letter-text .lud-greeting {
          font-size: 1.15em;
          margin-bottom: 6%;
        }

        /* photos placed while writing, shown exactly where and how they
           were positioned -- no drag/resize/rotate handles here, this is
           read-only, matching how petals/bubbles sit behind the letter */
        .pf-photo-layer { position: relative; height: 0; z-index: 2; }
        .pf-placed-photo { position: absolute; }
        .pf-frame-preview, .pf-frame-body { background-size: cover; background-position: center; width: 100%; height: 100%; position: relative; }
        .pf-frame-square .pf-frame-body { border-radius: 4px; border: 3px solid #fff; box-shadow: 0 3px 10px rgba(0,0,0,.2); }
        .pf-frame-circle .pf-frame-body { border-radius: 50%; border: 3px solid #fff; box-shadow: 0 3px 10px rgba(0,0,0,.2); }
        .pf-frame-oval .pf-frame-body { border-radius: 50%; border: 3px solid #fff; box-shadow: 0 3px 10px rgba(0,0,0,.2); }
        .pf-frame-oval.pf-placed-photo { aspect-ratio: 4 / 3; }
        .pf-frame-star .pf-frame-body { clip-path: url(#starClip); box-shadow: 0 3px 10px rgba(0,0,0,.2); }
        .pf-frame-heart .pf-frame-body { clip-path: url(#heartClip); box-shadow: 0 3px 10px rgba(0,0,0,.2); }
        .pf-frame-arch .pf-frame-body { border-radius: 50% 50% 4px 4px / 30% 30% 4px 4px; border: 3px solid #fff; box-shadow: 0 3px 10px rgba(0,0,0,.2); }
        .pf-frame-cloud .pf-frame-body { clip-path: url(#cloudClip); box-shadow: 0 3px 10px rgba(0,0,0,.2); }
        .pf-frame-flower .pf-frame-body { clip-path: url(#flowerClip); box-shadow: 0 3px 10px rgba(0,0,0,.2); }
        .pf-frame-polaroid .pf-frame-body { background: #fff; padding: 8% 8% 22% 8%; box-shadow: 0 4px 12px rgba(0,0,0,.25); }
        .pf-frame-polaroid .pf-frame-body .pf-polaroid-img { width: 100%; height: 100%; background-size: cover; background-position: center; }
      `}</style>

      <div
        className="lud-root"
        style={{
          "--pink": theme.page[0],
          "--pink-deep": theme.page[1],
          "--bubble-mid": theme.bubble.mid,
          "--bubble-outer": theme.bubble.outer,
          "--bubble-edge": theme.bubble.edge,
          "--bubble-shadow": theme.bubble.shadow,
        }}
      >
        <svg width="0" height="0" style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
          <defs>
            <filter id="lud-paper-tear-filter" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        <div className={`lud-page ${pageClass}`}>
          <button className="lud-close-btn btn btn-yellow" onClick={reset} aria-label="Close the letter">{"\u2715"}</button>

          <div ref={petalFieldRef} className={`lud-petal-field ${burst ? "burst" : ""}`}>
            {generatedPetals.map((p) => (
              <div key={p.id} className={p.className.replace("petal", "lud-petal")} style={p.style}>
                <div className="lud-petal-asset" style={{ backgroundImage: `url("${p.url}")` }} />
              </div>
            ))}
          </div>

          <div ref={bubbleFieldRef} className={`lud-bubble-field ${burst ? "burst" : ""}`}>
            {generatedBubbles.map((b) => (
              <div key={b.id} className="lud-bubble" style={b.style} />
            ))}
          </div>

          <div className="lud-letter-wrap">
            {/* Envelope */}
            <div className="lud-envelope">
              <div className="lud-env-back" />
              <div className="lud-env-inner-shadow" />
              <div className="lud-env-flap-open" />
              <div className="lud-env-pocket" />
              <div className="lud-env-side-flaps" />
            </div>

            {/* Letter Paper */}
            <div ref={sheetRef} className={`lud-sheet ${sheetClass}`}>
              <div className="lud-fold-shadow top" />
              <div className="lud-fold-shadow bottom" />

              <div className="lud-panel lud-panel-top" />
              <div className="lud-panel lud-panel-mid" />
              <div className="lud-panel lud-panel-bottom" />
            </div>

            <div className="lud-letter-face">
              <div className="lud-crease lud-crease-1" />
              <div className="lud-crease lud-crease-2" />
              <div ref={letterTextRef} className="lud-letter-text">
                {letter && letter.greeting && <div className="lud-greeting">{letter.greeting}</div>}
                <div className="lud-body-content">{letter && letter.body}</div>
                <div className="lud-sign-off">{letter && letter.signoff}</div>
              </div>
            </div>
          </div>

          {letter && letter.photos && letter.photos.length > 0 && (
            <div className="pf-photo-layer">
              {letter.photos.map((photo) => (
                <div
                  key={photo.id}
                  className={"pf-placed-photo pf-frame-" + photo.shape}
                  style={{
                    left: photo.x, top: photo.y, width: photo.size,
                    height: photo.shape === "oval" ? photo.size * 0.75 : photo.size,
                    transform: `rotate(${photo.rotation || 0}deg)`,
                  }}
                >
                  <PhotoFrame shape={photo.shape} dataUrl={photo.dataUrl} imgRatio={photo.imgRatio} pos={{ x: photo.posX, y: photo.posY }} zoom={photo.zoom} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
