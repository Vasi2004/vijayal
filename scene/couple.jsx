/* couple.jsx
   The two of you walking around on the grass. Wandering, facing the way you
   walk, pausing, and the click-to-jump interaction where one jumps and the
   other comes running over for a hug. Also keeps you both between the two
   big cherry trees. */

import { useEffect, useRef } from "react";
import { PixelHeart } from "./doodles.jsx";
import { prefersReducedMotion } from "../gsap.js";
import { SPRITES } from "./sprites.js";

export function PixelCouple({ active }) {
  const stripRef = useRef(null);
  const boyRef = useRef(null);
  const girlRef = useRef(null);
  const hugRef = useRef(null);
  const heartRef = useRef(null);
  const boyHitRef = useRef(null);
  const girlHitRef = useRef(null);
  const handlersRef = useRef({ click: () => {}, enter: () => {}, leave: () => {} });
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced || !active) return;
    const S = 0.8;
    const speed = 34;
    const mkChar = (el, walk, idle, jump, jumpSeq, startFrac, scale = 1, idleInverted = false, idleScale = 1, jumpScale = 1, jumpLift = 0) => ({
      el, walk, idle, jump, jumpSeq, scale, idleInverted, idleScale, jumpScale, jumpLift,
      x: window.innerWidth * startFrac,
      dir: Math.random() < 0.5 ? -1 : 1,
      mode: "walk",
      target: 0,
      until: 0,
      frame: 0,
      ft: 0,
      jumpIdx: 0,
      jumpFt: 0,
      /* stay between the two big cherry trees: the left one occupies
         left -1.5vw + 185px, the right one right -2vw + 195px */
      walkBounds() {
        const w = window.innerWidth;
        const min = -0.015 * w + 185 + 12;
        const max = w * 1.02 - 195 - 12;
        return max > min + 80 ? [min, max] : [w * 0.12, w * 0.88];
      },
      pickTarget(now) {
        const [min, max] = this.walkBounds();
        this.target = min + Math.random() * (max - min);
        this.dir = this.target > this.x ? 1 : -1;
        this.mode = "walk";
      },
      step(dt, now) {
        const spr = this.el.firstChild;
        if (this.mode === "idle") {
          if (now > this.until) this.pickTarget(now);
          this.setSprite(spr, this.idle, 0);
          this.el.style.transform = `translateX(${this.x}px)`;
          return;
        }
        this.x += this.dir * speed * dt;
        const [bmin, bmax] = this.walkBounds();
        if (this.x < bmin) { this.x = bmin; this.target = bmin; }
        if (this.x > bmax) { this.x = bmax; this.target = bmax; }
        if ((this.dir > 0 && this.x >= this.target) || (this.dir < 0 && this.x <= this.target)) {
          this.mode = "idle";
          this.until = now + 1 + Math.random() * 3.2;
        }
        this.ft += dt;
        if (this.ft > 0.14) { this.ft = 0; this.frame = (this.frame + 1) % this.walk.n; }
        this.setSprite(spr, this.walk, this.frame);
        this.el.style.transform = `translateX(${this.x}px)`;
      },
      /* walks continuously toward a live target (the jumping partner),
         50% faster than normal wandering speed, never idling, used while
         the other character is jumping */
      chase(dt, targetX) {
        const spr = this.el.firstChild;
        if (targetX > this.x + 2) this.dir = 1;
        else if (targetX < this.x - 2) this.dir = -1;
        if (Math.abs(targetX - this.x) > 2) this.x += this.dir * speed * 1.5 * dt;
        const [bmin, bmax] = this.walkBounds();
        this.x = Math.min(Math.max(this.x, bmin), bmax);
        this.ft += dt;
        if (this.ft > 0.14) { this.ft = 0; this.frame = (this.frame + 1) % this.walk.n; }
        this.setSprite(spr, this.walk, this.frame);
        this.el.style.transform = `translateX(${this.x}px)`;
      },
      /* bounces through squat -> mid -> up -> mid repeatedly, in place.
         The sprite frames themselves already vary in height (squat is
         shorter, the peak pose reaches taller), so that alone reads as
         the jump motion; no extra vertical offset is layered on top,
         which was compounding with the frame-height change and causing
         a jittery double-motion. */
      doJump(dt) {
        const spr = this.el.firstChild;
        this.jumpFt += dt;
        if (this.jumpFt > 0.22) { this.jumpFt = 0; this.jumpIdx = (this.jumpIdx + 1) % this.jumpSeq.length; }
        const fi = this.jumpSeq[this.jumpIdx];
        this.setSprite(spr, this.jump, fi);
        /* jumpLift adds a little airtime on the mid and peak frames, on top of
           what the frame heights already give */
        const lift = this.jumpLift ? [0, this.jumpLift * 0.55, this.jumpLift][fi] || 0 : 0;
        this.el.style.transform = `translateX(${this.x}px) translateY(${-lift}px)`;
      },
      setSprite(spr, spec, frame) {
        const isIdle = spec === this.idle;
        const isJump = spec === this.jump;
        const stateScale = isIdle ? this.idleScale : isJump ? this.jumpScale : 1;
        const s = S * this.scale * stateScale;
        spr.style.width = spec.w * s + "px";
        spr.style.height = spec.h * s + "px";
        spr.style.backgroundImage = `url(${spec.src})`;
        spr.style.backgroundSize = `${spec.w * spec.n * s}px ${spec.h * s}px`;
        spr.style.backgroundPosition = `${-frame * spec.w * s}px 0`;
        /* walk art faces right (mirror when heading left). Vasi's idle pose
           is drawn facing the opposite default from his walk art, so his
           idle mirror rule is inverted; Vijayal's idle already matches her
           walk's default facing, so hers uses the normal rule. */
        const flip = (isIdle && this.idleInverted) ? this.dir > 0 : this.dir < 0;
        spr.style.transform = flip ? "scaleX(-1)" : "none";
      },
    });

    /* both start together at the cabin (right: 26vw ~= 74% across) and
       wander out from there once the main frame is up.
       Jump frames are 0=ground squat, 1=mid-rise, 2=squat-in-the-air. */
    const BOY_JUMP_SEQ = [1, 0, 2, 0];   // 2,1,3,1 repeating (1-indexed)
    const GIRL_JUMP_SEQ = [0, 1, 2, 1];  // 1,2,3,2 repeating (1-indexed)
    const boy = mkChar(boyRef.current, SPRITES.boyWalk, SPRITES.boyIdle, SPRITES.boyJump, BOY_JUMP_SEQ, 0.72, 1, true, 1, 1);
    const girl = mkChar(girlRef.current, SPRITES.girlWalk, SPRITES.girlIdle, SPRITES.girlJump, GIRL_JUMP_SEQ, 0.76, 0.9, false, 1, 0.86, 13); /* Vijayal: 10% shorter, with a bouncier hop */
    const clampX = (x) => {
      const w = window.innerWidth;
      const min = -0.015 * w + 185 + 12;
      const max = w * 1.02 - 195 - 12;
      return max > min + 80 ? Math.min(Math.max(x, min), max) : Math.min(Math.max(x, w * 0.12), w * 0.88);
    };
    boy.x = clampX(boy.x); girl.x = clampX(girl.x);
    boy.pickTarget(0);
    girl.pickTarget(0);

    /* click a character: they jump in place, and the other character
       stops wandering to walk over for a hug. Wired through a ref so the
       JSX can use React's own onClick/onMouseEnter/onMouseLeave (reliable,
       no manual DOM listener timing to worry about) while still reaching
       into this effect's live boy/girl/jumperKey state. */
    let jumperKey = null;

    const onCharClick = (key) => {
      if (hugging || jumperKey === key) return;
      jumperKey = key;
      const ch = key === "boy" ? boy : girl;
      const other = key === "boy" ? girl : boy;
      ch.dir = other.x >= ch.x ? 1 : -1; /* face the partner before jumping */
      ch.jumpIdx = 0; ch.jumpFt = 0;
      showExcl(key); /* lock the mark visible; onLeave won't clear it while jumperKey === key */
    };
    const showExcl = (key) => { const e = (key === "boy" ? boyRef.current : girlRef.current).querySelector(".excl"); if (e) e.style.opacity = "1"; };
    const hideExcl = (key) => { const e = (key === "boy" ? boyRef.current : girlRef.current).querySelector(".excl"); if (e) e.style.opacity = "0"; };
    const hideAllExcl = () => { hideExcl("boy"); hideExcl("girl"); };
    /* normal hover: shows while hovering, hides on mouse-leave. Exception:
       once a character is clicked (becomes the jumper), their mark stays
       locked visible even after the mouse leaves, until the hug clears it. */
    const onEnter = (key) => showExcl(key);
    const onLeave = (key) => { if (jumperKey !== key) hideExcl(key); };
    handlersRef.current = { click: onCharClick, enter: onEnter, leave: onLeave };

    let hugUntil = 0;
    let hugCooldown = performance.now() / 1000 + 6;
    let hugFrame = 0;
    let hugFt = 0;
    let hugging = false;
    const hugEl = hugRef.current;
    const hugSpr = hugEl.firstChild;
    const HS = SPRITES.hug;
    hugSpr.style.width = HS.w * S + "px";
    hugSpr.style.height = HS.h * S + "px";
    hugSpr.style.backgroundImage = `url(${HS.src})`;
    hugSpr.style.backgroundSize = `${HS.w * HS.n * S}px ${HS.h * S}px`;

    let last = performance.now();
    let raf;
    const triggerHug = (now) => {
      hugging = true;
      hugUntil = now + 3;
      hugFrame = 0; hugFt = 0;
      hideAllExcl();
      const mid = (boy.x + girl.x) / 2;
      hugEl.style.transform = `translateX(${mid - (HS.w * S) / 2 + 18}px)`;
      hugEl.style.display = "block";
      boy.el.style.display = "none";
      girl.el.style.display = "none";
      if (heartRef.current) {
        /* center on the hug art's actual visual midpoint, not the raw
           boy/girl midpoint: the hug sprite itself is offset by +18px to
           line up with its art (see hugEl.transform below), so the heart
           needs that same correction or it skews toward one character */
        heartRef.current.style.transform = `translateX(${mid + 18 - 13}px) translateY(${-(HS.h * S) - 16}px)`;
        heartRef.current.style.display = "block";
      }
    };
    const loop = (t) => {
      const now = t / 1000;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;

      if (hugging) {
        hugFt += dt;
        if (hugFt > 0.5) { hugFt = 0; hugFrame = (hugFrame + 1) % HS.n; }
        hugSpr.style.backgroundPosition = `${-hugFrame * HS.w * S}px 0`;
        if (now > hugUntil) {
          hugging = false;
          jumperKey = null;
          hugEl.style.display = "none";
          if (heartRef.current) heartRef.current.style.display = "none";
          boy.el.style.display = "block";
          girl.el.style.display = "block";
          const mid = (boy.x + girl.x) / 2;
          boy.x = mid - 34; girl.x = mid + 34;
          boy.dir = -1; girl.dir = 1;
          boy.target = clampX(mid - 120 - Math.random() * 200);
          girl.target = clampX(mid + 120 + Math.random() * 200);
          boy.mode = "walk"; girl.mode = "walk";
          hugCooldown = now + 3; /* 3s cooldown after a hug ends */
        }
      } else if (jumperKey) {
        const jumper = jumperKey === "boy" ? boy : girl;
        const chaser = jumperKey === "boy" ? girl : boy;
        jumper.doJump(dt);
        chaser.chase(dt, jumper.x);
        if (now > hugCooldown && Math.abs(jumper.x - chaser.x) < 38) {
          jumperKey = null;
          triggerHug(now);
        }
      } else {
        boy.step(dt, now);
        girl.step(dt, now);
        if (now > hugCooldown && Math.abs(boy.x - girl.x) < 38) {
          triggerHug(now);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      handlersRef.current = { click: () => {}, enter: () => {}, leave: () => {} };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, active]);

  const spriteBase = { imageRendering: "pixelated", backgroundRepeat: "no-repeat" };
  const charBase = { position: "absolute", bottom: 0, left: 0, willChange: "transform" };

  if (!active) return null;

  if (reduced) {
    /* static, side-by-side idle pair under reduced motion */
    const stat = (spec, leftPct, scale = 0.8) => (
      <div style={{ ...charBase, left: leftPct, }}>
        <div style={{ ...spriteBase, width: spec.w * scale, height: spec.h * scale, backgroundImage: `url(${spec.src})`, backgroundSize: `${spec.w * spec.n * scale}px ${spec.h * scale}px` }} />
      </div>
    );
    return (
      <div ref={stripRef} aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: "calc(0.8vh + 4px)", height: 92, pointerEvents: "none", zIndex: 2 }}>
        {stat(SPRITES.boyIdle, "40%", 0.8)}
        {stat(SPRITES.girlIdle, "52%", 0.72)}
      </div>
    );
  }

  return (
    <div ref={stripRef} aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: "calc(0.8vh + 4px)", height: 92, pointerEvents: "none", zIndex: 2 }}>
      <div ref={boyRef} style={charBase} aria-label="Vasi">
        <div style={spriteBase} />
        <div className="excl">!</div>
        <div
          ref={boyHitRef}
          onClick={() => handlersRef.current.click("boy")}
          onMouseEnter={() => handlersRef.current.enter("boy")}
          onMouseLeave={() => handlersRef.current.leave("boy")}
          style={{ position: "absolute", top: 4, left: "50%", marginLeft: -18, width: 36, height: 30, pointerEvents: "auto", cursor: "pointer", zIndex: 6 }}
        />
      </div>
      <div ref={girlRef} style={charBase} aria-label="Vijayal">
        <div style={spriteBase} />
        <div className="excl">!</div>
        <div
          ref={girlHitRef}
          onClick={() => handlersRef.current.click("girl")}
          onMouseEnter={() => handlersRef.current.enter("girl")}
          onMouseLeave={() => handlersRef.current.leave("girl")}
          style={{ position: "absolute", top: 4, left: "50%", marginLeft: -18, width: 36, height: 30, pointerEvents: "auto", cursor: "pointer", zIndex: 6 }}
        />
      </div>
      <div ref={hugRef} style={{ ...charBase, display: "none" }}><div style={spriteBase} /></div>
      <div ref={heartRef} style={{ ...charBase, display: "none", pointerEvents: "none" }}>
        <div className="hug-heart"><PixelHeart size={26} fill="#f3a5b5" shade="#ef93ae" /></div>
      </div>
    </div>
  );
}

/* ===================== GSAP ambient engine =====================
   Loaded from CDN. Once ready, GSAP drives the ambient motion (petals,
   hearts, clouds, sway, breathing, CD spin, orbit, firework particles)
   for smoother, more controllable animation. CSS keyframes remain as a
   graceful fallback if the CDN fails. */
