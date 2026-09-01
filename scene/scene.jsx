/* scene.jsx
   Puts the whole background together and decides where everything sits: sky,
   hills, the stream, both houses, the farmstead, trees, bushes, lampposts,
   the bunny, and the night lighting layer. This is the file to open when you
   want to move something in the scene. */

import { PixelCouple } from "./couple.jsx";
import { BunnyDoodle, FlowerDoodle, GrassTuft, Lantern, MeadowFlowers, NightGlow, PixelCloud } from "./doodles.jsx";
import { CabinDoodle, DistantCottage, FarmProp, Moon, PixelBush, PixelHouse, PixelTree, Sun } from "./pixelart.jsx";
import { CabinTrail, River } from "./river.jsx";
import { HeartFireworks, HeartsLayer, LeafLayer, PetalLayer, ShootingStars, StarsLayer } from "./weather.jsx";

/* Layered mountain silhouettes for the far background. Three ranges, each one
   paler and higher than the last so they recede into the sky. */
function MountainRange({ night }) {
  const layers = [
    { d: "M0 150 L90 96 L150 124 L232 60 L300 110 L360 84 L430 128 L500 92 L560 130 L640 74 L700 120 L780 88 L860 132 L940 96 L1010 128 L1090 82 L1160 122 L1200 104 L1200 150 Z", fill: night ? "#5a4270" : "#b6a6da", op: 0.55, bottom: "21vh", height: "15vh" },
    { d: "M0 150 L70 118 L140 142 L220 96 L300 138 L380 108 L450 146 L540 100 L620 140 L700 112 L790 148 L870 104 L950 142 L1040 116 L1120 146 L1200 122 L1200 150 Z", fill: night ? "#43395f" : "#93b6c9", op: 0.6, bottom: "19.5vh", height: "12vh" },
    { d: "M0 150 L80 126 L170 148 L260 118 L340 146 L430 124 L520 150 L610 120 L700 148 L800 126 L890 150 L980 128 L1070 150 L1160 132 L1200 144 L1200 150 Z", fill: night ? "#2e3c47" : "#86b285", op: 0.7, bottom: "18.4vh", height: "9vh" },
  ];
  return (
    <>
      {layers.map((l, i) => (
        <svg
          key={i}
          viewBox="0 0 1200 150"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ position: "absolute", left: 0, right: 0, bottom: l.bottom, width: "100%", height: l.height, opacity: l.op, display: "block" }}
        >
          <path d={l.d} fill={l.fill} />
        </svg>
      ))}
    </>
  );
}

/* ===================== Ambient background ===================== */

export function AmbientBackground({ theme = "day", active = false }) {
  const night = theme === "night";
  /* day sky: purple at the top, sinking through pink into a warm
     orange/yellow just above the horizon */
  const dayBg =
    "linear-gradient(180deg, #8f7cc6 0%, #a98ad2 12%, #c795cf 24%, #e3a3c6 36%, " +
    "#f4b6c6 47%, #ffc9b4 58%, #ffdcac 67%, #ffeec2 74%, #e9efd2 84%, var(--grass) 100%)";
  /* night: the same journey as the day sky (deep overhead, warm at the
     horizon) but in midnight purples and blues with a pink undertone */
  const nightBg =
    "linear-gradient(180deg, #1a1436 0%, #241a47 14%, #33205a 27%, #46265f 39%, " +
    "#5d2f63 50%, #7a3a66 60%, #93465f 69%, #6d3f57 78%, #2c3b3c 88%, #1d3527 100%)";
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, background: night ? nightBg : dayBg, transition: "background .6s ease" }}>
      {/* lighting wash: warm pink by day, cool moonlight by night */}
      {!night && (
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 10%, rgba(196,150,220,.30), transparent 52%), radial-gradient(ellipse at 50% 62%, rgba(255,190,170,.32), transparent 55%), radial-gradient(ellipse at 12% 92%, rgba(248,200,216,.30), transparent 45%), radial-gradient(ellipse at 88% 92%, rgba(255,214,170,.28), transparent 45%)" }} />
      )}
      {night && (
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 76% 14%, rgba(253,242,200,.20), transparent 42%), radial-gradient(ellipse at 50% 62%, rgba(226,120,150,.20), transparent 55%), radial-gradient(ellipse at 20% 90%, rgba(140,110,190,.24), transparent 50%)" }} />
      )}

      {night && <StarsLayer />}
      {night && <ShootingStars />}
      {night && (
        <div style={{ position: "absolute", top: "6%", right: "12%" }}>
          <Moon size={104} />
        </div>
      )}
      {!night && (
        <div className="breather" style={{ position: "absolute", top: "5%", left: "7%", animationDuration: "7s" }}>
          <Sun size={118} />
        </div>
      )}

      {/* Clouds filling the whole sky band, from just under the sun down to
          where the panel begins. Tops are stepped evenly so there are no
          bare stretches, and each has its own shape, size, speed and
          starting offset so the sky never repeats. */}
      <PixelCloud variant="bank" size={237} top="9.9%" dur="150s" delay="-2s" opacity={night ? 0.2 : 0.87} night={night} />
      <PixelCloud variant="wide" size={263} top="11.8%" dur="167s" delay="-103s" opacity={night ? 0.2 : 0.85} night={night} />
      <PixelCloud variant="lumpy" size={229} top="13.7%" dur="184s" delay="-44s" opacity={night ? 0.19 : 0.83} night={night} />
      <PixelCloud variant="tall" size={256} top="15.5%" dur="201s" delay="-170s" opacity={night ? 0.18 : 0.8} night={night} />
      <PixelCloud variant="streak" size={235} top="14.9%" dur="218s" delay="-103s" opacity={night ? 0.19 : 0.81} night={night} />
      <PixelCloud variant="small" size={201} top="16.8%" dur="235s" delay="-23s" opacity={night ? 0.18 : 0.79} night={night} />
      <PixelCloud variant="wisp" size={227} top="18.7%" dur="252s" delay="-177s" opacity={night ? 0.17 : 0.76} night={night} />
      <PixelCloud variant="puff" size={206} top="18.1%" dur="269s" delay="-89s" opacity={night ? 0.18 : 0.77} night={night} />
      <PixelCloud variant="tuft" size={233} top="19.9%" dur="166s" delay="-155s" opacity={night ? 0.17 : 0.75} night={night} />
      <PixelCloud variant="bank" size={199} top="21.8%" dur="183s" delay="-103s" opacity={night ? 0.16 : 0.73} night={night} />
      <PixelCloud variant="wide" size={165} top="23.7%" dur="200s" delay="-37s" opacity={night ? 0.16 : 0.7} night={night} />
      <PixelCloud variant="lumpy" size={204} top="23.1%" dur="217s" delay="-172s" opacity={night ? 0.16 : 0.71} night={night} />
      <PixelCloud variant="tall" size={171} top="24.9%" dur="234s" delay="-98s" opacity={night ? 0.15 : 0.69} night={night} />
      <PixelCloud variant="streak" size={197} top="26.8%" dur="251s" delay="-11s" opacity={night ? 0.15 : 0.66} night={night} />
      <PixelCloud variant="small" size={176} top="26.2%" dur="268s" delay="-174s" opacity={night ? 0.15 : 0.67} night={night} />
      <PixelCloud variant="wisp" size={143} top="28.0%" dur="165s" delay="-45s" opacity={night ? 0.14 : 0.65} night={night} />
      <PixelCloud variant="puff" size={169} top="29.9%" dur="182s" delay="-160s" opacity={night ? 0.13 : 0.63} night={night} />
      <PixelCloud variant="tuft" size={135} top="31.8%" dur="199s" delay="-101s" opacity={night ? 0.13 : 0.6} night={night} />
      <PixelCloud variant="bank" size={175} top="31.2%" dur="216s" delay="-29s" opacity={night ? 0.13 : 0.61} night={night} />
      <PixelCloud variant="wide" size={141} top="33.0%" dur="233s" delay="-172s" opacity={night ? 0.12 : 0.59} night={night} />
      <PixelCloud variant="lumpy" size={107} top="34.9%" dur="250s" delay="-91s" opacity={night ? 0.12 : 0.56} night={night} />
      <PixelCloud variant="tall" size={146} top="34.3%" dur="267s" delay="-259s" opacity={night ? 0.12 : 0.57} night={night} />
      <PixelCloud variant="streak" size={113} top="36.2%" dur="164s" delay="-98s" opacity={night ? 0.11 : 0.55} night={night} />
      <PixelCloud variant="small" size={139} top="38.0%" dur="181s" delay="-40s" opacity={night ? 0.11 : 0.52} night={night} />
      <PixelCloud variant="wisp" size={106} top="39.9%" dur="198s" delay="-164s" opacity={night ? 0.1 : 0.5} night={night} />
      <PixelCloud variant="puff" size={85} top="39.3%" dur="215s" delay="-97s" opacity={night ? 0.1 : 0.51} night={night} />

      {/* everything below gets relit at night via a single filter */}
      <div style={{ position: "absolute", inset: 0, filter: night ? "brightness(.62) saturate(.78) hue-rotate(-8deg)" : "none", transition: "filter .6s ease" }}>

      {/* soft horizon glow band */}
      <div style={{ position: "absolute", bottom: "18vh", left: 0, right: 0, height: "16vh", background: "linear-gradient(180deg, transparent, rgba(255,206,150,.55) 50%, rgba(250,180,205,.40))", opacity: 0.85 }} />

      {/* mountain range, sitting behind the hills and fading into the sky */}
      <MountainRange night={night} />

      {/* rolling hills */}
      <div style={{ position: "absolute", bottom: "-14vh", left: "-15vw", width: "70vw", height: "36vh", background: "var(--grass-deep)", borderRadius: "50%", opacity: 0.9 }} />
      <div style={{ position: "absolute", bottom: "-16vh", right: "-18vw", width: "80vw", height: "38vh", background: "#7db35e", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "-18vh", left: "22vw", width: "76vw", height: "32vh", background: "#9ac97c", borderRadius: "50%", opacity: 0.8 }} />


      {/* wildflowers dotted over the hills across the water */}
      <MeadowFlowers far={45} back={38} near={55} night={night} />

      {/* a second, smaller cottage further back and to the left. Drawn before
          the far-bank trees so they pass in front of it, which is what sells
          it as sitting deeper in the scene. */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "18.7vh", left: "15.5vw", zIndex: 1, opacity: 0.88 }}>
        <DistantCottage size={44} night={night} />
      </div>

      {/* distant cottage tucked into the far hill (deepest layer) */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "17vh", left: "24vw", zIndex: 1 }}>
        <DistantCottage size={66} night={night} />
      </div>

      {/* ---- far side of the stream: low bushes on the hills plus a small
           farm, each sitting on the bank line at its own x so they stay
           grounded at any window size ---- */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 6.56vw)", left: "8vw", zIndex: 1, opacity: .84 }}>
        <PixelBush variant="green" size={44} dur="6.4s" delay="-1.9s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 6.19vw)", left: "17vw", zIndex: 1, opacity: .82 }}>
        <PixelBush variant="floral" size={40} dur="5.9s" delay="-3.3s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 6.75vw)", left: "46vw", zIndex: 1, opacity: .84 }}>
        <PixelBush variant="green" size={42} dur="6.8s" delay="-2.5s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.98vw)", right: "20vw", zIndex: 1, opacity: .82 }}>
        <PixelBush variant="floral" size={38} dur="6.1s" delay="-4.7s" night={night} />
      </div>

      {/* ---- far-bank woodland: small trees dotted along the far side.
           zIndex 1 keeps them behind everything on the near bank, and each
           bottom offset is the measured bank height at that x, so none of
           them float or dip into the water. Gaps chosen to clear the distant
           cottage (24vw-28.6vw) and the farm bushes already planted. ---- */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.31vw)", left: "3vw", zIndex: 1, opacity: .8 }}>
        <PixelTree variant="green" size={44} dur="9.2s" delay="-1.1s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 6.76vw)", left: "13.5vw", zIndex: 1, opacity: .78 }}>
        <PixelTree variant="cherry" size={38} dur="8.7s" delay="-4.2s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 6.87vw)", left: "22.5vw", zIndex: 1, opacity: .76 }}>
        <PixelTree variant="conifer" size={30} dur="9.6s" delay="-2.8s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.04vw)", left: "31.5vw", zIndex: 1, opacity: .78 }}>
        <PixelTree variant="green" size={44} flip dur="8.9s" delay="-6.1s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 6.86vw)", left: "36.5vw", zIndex: 1, opacity: .76 }}>
        <PixelTree variant="cherry" size={38} dur="9.4s" delay="-3.5s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 6.91vw)", left: "42.5vw", zIndex: 1, opacity: .74 }}>
        <PixelTree variant="conifer" size={34} flip dur="10.1s" delay="-7.3s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.54vw)", left: "51.5vw", zIndex: 1, opacity: .78 }}>
        <PixelTree variant="green" size={42} dur="8.4s" delay="-5.6s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.66vw)", left: "56.5vw", zIndex: 1, opacity: .74 }}>
        <PixelTree variant="cherry" size={34} flip dur="9.9s" delay="-2.2s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.70vw)", left: "63vw", zIndex: 1, opacity: .76 }}>
        <PixelTree variant="conifer" size={38} dur="9.1s" delay="-8.4s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 8.13vw)", left: "69vw", zIndex: 1, opacity: .74 }}>
        <PixelTree variant="green" size={36} flip dur="10.4s" delay="-1.7s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 8.42vw)", left: "73.5vw", zIndex: 1, opacity: .72 }}>
        <PixelTree variant="cherry" size={32} dur="9.7s" delay="-6.8s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 8.40vw)", left: "86vw", zIndex: 1, opacity: .72 }}>
        <PixelTree variant="conifer" size={32} flip dur="10.8s" delay="-4.9s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 8.58vw)", left: "90.5vw", zIndex: 1, opacity: .7 }}>
        <PixelTree variant="green" size={30} dur="9.3s" delay="-9.1s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 9.0vw)", left: "95.5vw", zIndex: 1, opacity: .7 }}>
        <PixelTree variant="cherry" size={30} flip dur="10.2s" delay="-3.1s" night={night} />
      </div>

      {/* more of the far-bank woodland, filling the gaps between the
           trees already planted; sized smaller and kept on zIndex 1 so
           they stay behind everything on the near bank */}


      {/* a further layer of far-bank woodland, tucked into the gaps.
           These are the smallest trees in the scene and sit on zIndex 1,
           so they read as the furthest back without clipping anything. */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.16vw)", left: "0.6vw", zIndex: 1, opacity: 0.74 }}>
        <PixelTree variant="conifer" size={26} flip dur="8.6s" delay="-0.8s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 6.81vw)", left: "11.6vw", zIndex: 1, opacity: 0.7 }}>
        <PixelTree variant="green" size={20} flip dur="9.6s" delay="-2.2s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 6.69vw)", left: "20.3vw", zIndex: 1, opacity: 0.74 }}>
        <PixelTree variant="cherry" size={23} flip dur="8.6s" delay="-3.6s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.03vw)", left: "29.2vw", zIndex: 1, opacity: 0.72 }}>
        <PixelTree variant="green" size={25} dur="9.1s" delay="-4.3s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 6.79vw)", left: "39.8vw", zIndex: 1, opacity: 0.68 }}>
        <PixelTree variant="cherry" size={30} dur="10.1s" delay="-5.7s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.42vw)", left: "49.4vw", zIndex: 1, opacity: 0.72 }}>
        <PixelTree variant="conifer" size={22} dur="9.1s" delay="-7.1s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.6vw)", left: "54.8vw", zIndex: 1, opacity: 0.7 }}>
        <PixelTree variant="cherry" size={18} flip dur="9.6s" delay="-7.8s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.64vw)", left: "59.9vw", zIndex: 1, opacity: 0.68 }}>
        <PixelTree variant="green" size={30} dur="10.1s" delay="-8.5s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 7.9vw)", left: "66.3vw", zIndex: 1, opacity: 0.74 }}>
        <PixelTree variant="conifer" size={30} flip dur="8.6s" delay="-9.2s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 8.27vw)", left: "71.9vw", zIndex: 1, opacity: 0.72 }}>
        <PixelTree variant="cherry" size={18} dur="9.1s" delay="-9.9s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 8.37vw)", left: "82.0vw", zIndex: 1, opacity: 0.68 }}>
        <PixelTree variant="conifer" size={30} dur="10.1s" delay="-11.3s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 8.43vw)", left: "88.7vw", zIndex: 1, opacity: 0.74 }}>
        <PixelTree variant="cherry" size={18} flip dur="8.6s" delay="-12.0s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 8.79vw)", left: "93.1vw", zIndex: 1, opacity: 0.72 }}>
        <PixelTree variant="green" size={26} dur="9.1s" delay="-12.7s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 9.18vw)", left: "98.1vw", zIndex: 1, opacity: 0.7 }}>
        <PixelTree variant="conifer" size={20} flip dur="9.6s" delay="-13.4s" night={night} />
      </div>

      {/* ---- left storybook margin, back to front ---- */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 3.12vw)", left: "calc(7vw + 37px)", zIndex: 1, opacity: .88 }}>
        <PixelTree variant="cherry" size={88} dur="7.8s" delay="-3.4s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "1vh", left: "-1.5vw", zIndex: 2 }}>
        <PixelTree variant="cherry" size={185} dur="7s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "1.5vh", left: "15.5vw", zIndex: 2 }}>
        <PixelTree variant="green" size={140} dur="6.4s" delay="-1.6s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "0.5vh", left: "6.5vw", zIndex: 4 }}>
        <PixelBush variant="floral" size={130} dur="5.4s" delay="-1.4s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "1vh", left: "calc(11.25vw + 49px)", zIndex: 3 }}>
        <Lantern size={52} />
      </div>

      {/* ---- right storybook margin, back to front ---- */}
      {/* big green tree, dead centre of the grass and set back toward the
          stream. zIndex 1 keeps it behind the walking couple (zIndex 2). */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.25vh + 2.6vw)", left: "calc(50vw - 68px)", zIndex: 1, opacity: .95 }}>
        <PixelTree variant="conifer" size={135} flip dur="7s" delay="-4s" night={night} glow={false} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "0.5vh", right: "-2vw", zIndex: 2 }}>
        <PixelTree variant="cherry" size={195} flip dur="7.6s" delay="-2.8s" night={night} />
      </div>
      {/* smaller cherry filling the gap between the cabin and the edge */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(0.5vh + 4.91vw)", right: "calc(10vw + 8px)", zIndex: 1, opacity: .88 }}>
        <PixelTree variant="cherry" size={76} flip dur="8.2s" delay="-5.2s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "1vh", right: "8vw", zIndex: 3 }}>
        <PixelBush variant="green" size={140} dur="5s" delay="-2.6s" night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "1vh", right: "15.5vw", zIndex: 3 }}>
        <Lantern size={54} />
      </div>
      {/* lamppost on the cabin path, past the stream */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "1vh", right: "calc(26vw + 340px)", zIndex: 3 }}>
        <Lantern size={54} />
      </div>
      {/* full-width stream, entering and exiting off both screen edges;
          z0 keeps it behind every tree, house, cabin and lamppost */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "0.5vh", left: 0, right: 0, zIndex: 0 }}>
        <River night={night} />
      </div>
      {/* curvy dirt footpath from the cabin down toward the bottom, centered
          under the cabin's door and height-matched to the cabin's own lift */}
      <div className="side-scenery" style={{ position: "absolute", bottom: 0, right: "26vw", zIndex: 1 }}>
        <CabinTrail />
      </div>
      {/* ---- small farmstead beside the cabin: hay and a campfire tucked in
           next to it, the tractor and vegetable patch further along, all on
           the cabin's own ground line ---- */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "5.2vh", right: "calc(26vw - 132px)", zIndex: 2 }}>
        <FarmProp kind="hay" size={53} night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "calc(5.2vh + 13px)", right: "calc(26vw + 216px)", zIndex: 2 }}>
        <FarmProp kind="veg" size={104} night={night} />
      </div>

      {/* big log cabin, middle-bottom-right, shifted right 20px so the door
          lines up with the footpath's actual top (path centerline sits at
          x=95 in the shared 150px box, not x=75 where the door sits) */}
      <div className="breather side-scenery" style={{ position: "absolute", bottom: "5.5vh", right: "calc(26vw - 77px)", animationDuration: "7s", zIndex: 2 }}>
        <CabinDoodle size={285} night={night} />
      </div>
      <div className="side-scenery" style={{ position: "absolute", bottom: "3.9vh", right: "calc(26vw - 57px)", zIndex: 2 }}>
        <FarmProp kind="tractor" size={59} night={night} />
      </div>

      {/* lamppost on the left path, past the bunny */}
      <div className="side-scenery" style={{ position: "absolute", bottom: "1vh", left: "35vw", zIndex: 3 }}>
        <Lantern size={54} />
      </div>

      {/* bunny: sits behind the wandering pixel couple (couple is z2) */}
      <div style={{ position: "absolute", bottom: "3.5vh", left: "22vw", zIndex: 1 }}>
        <BunnyDoodle size={56} />
      </div>

      {/* dense flowers + grass along the bottom, front-most ground layer */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "0 1vw 6px", pointerEvents: "none", zIndex: 4 }}>
        <GrassTuft h={26} dur="2.8s" />
        <FlowerDoodle petal="#f3a5b5" dur="3.2s" />
        <GrassTuft h={32} dur="2.4s" delay="-1s" />
        <FlowerDoodle petal="#f8c8d8" center="#fff3c9" dur="2.9s" delay="-2s" size={30} />
        <GrassTuft h={24} dur="3s" delay="-.6s" />
        <FlowerDoodle petal="#b39ddb" center="#fff3c9" dur="3.4s" delay="-1.2s" size={28} />
        <GrassTuft h={30} dur="2.6s" delay="-2.2s" />
        <FlowerDoodle petal="#ef93ae" dur="3.1s" delay="-1.4s" size={32} />
        <GrassTuft h={27} dur="2.9s" delay="-1.8s" />
        <FlowerDoodle petal="#8fd8cf" dur="3.5s" delay="-.4s" size={30} />
        <GrassTuft h={33} dur="2.5s" delay="-.3s" />
        <FlowerDoodle petal="#f5d76e" center="#e78f6c" dur="3s" delay="-.8s" size={28} />
        <GrassTuft h={25} dur="2.7s" delay="-1.1s" />
        <FlowerDoodle petal="#f3a5b5" dur="3.3s" delay="-2.6s" size={31} />
        <GrassTuft h={29} dur="2.85s" delay="-.9s" />
        <FlowerDoodle petal="#f8c8d8" dur="3.15s" delay="-1.7s" size={27} />
        <GrassTuft h={31} dur="2.55s" delay="-2s" />
      </div>
      
      {/* pixel couple wandering the grass: kept inside the scenery layer so
      the flowers, grass band, trees and lampposts pass in front of them */}
      <PixelCouple active={active} night={night} />
      </div>

      {/* windows and lanterns light up at night (above the relight filter) */}
      {night && (
        <div className="side-scenery" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
          {/* left margin lantern */}
          <NightGlow size={78} style={{ left: "calc(11.25vw + 36px)", bottom: "calc(1vh + 31px)" }} />
          {/* left path lantern */}
          <NightGlow size={80} delay="-1.1s" style={{ left: "calc(35vw - 13px)", bottom: "calc(1vh + 33px)" }} />
          {/* right margin lantern */}
          <NightGlow size={80} delay="-2.2s" style={{ right: "calc(15.5vw - 13px)", bottom: "calc(1vh + 33px)" }} />

          {/* cabin path lantern */}
          <NightGlow size={80} delay="-0.6s" style={{ right: "calc(26vw + 327px)", bottom: "calc(1vh + 33px)" }} />
          {/* house/cabin window glow is now self-contained in each PixelHouse (night prop) */}


          {/* ground flowers glow along the meadow */}
          {[
            { at: "8.8%", tone: "243,165,181", d: "-0.4s" },
            { at: "20.6%", tone: "248,200,216", d: "-1.2s" },
            { at: "32.4%", tone: "179,157,219", d: "-2s" },
            { at: "44.1%", tone: "239,147,174", d: "-0.8s" },
            { at: "55.9%", tone: "143,216,207", d: "-1.7s" },
            { at: "67.6%", tone: "245,215,110", d: "-2.5s" },
            { at: "79.4%", tone: "243,165,181", d: "-1s" },
            { at: "91.2%", tone: "248,200,216", d: "-2.9s" },
          ].map((f, i) => (
            <NightGlow key={i} size={36} core={false} tone={f.tone} delay={f.d} style={{ left: `calc(${f.at} - 18px)`, bottom: "13px", opacity: .7 }} />
          ))}

        </div>
      )}

      {/* ambient layers on top of scenery */}
      <div style={{ opacity: night ? 0.55 : 1 }}>
        <PetalLayer />
        <LeafLayer />
      </div>
      {!night && <HeartsLayer />}
      <HeartFireworks night={night} />
    </div>
  );
}
