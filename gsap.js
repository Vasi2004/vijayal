/* gsap.js
   Loads the GSAP animation library from a CDN and reports when it is ready.
   Also checks whether the device asks for reduced motion, which switches the
   busier animations off. Everything has a CSS fallback, so the scene still
   moves if this never loads. */

import { useState, useEffect } from "react";

export let gsapPromise = null;

export function loadGsap() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.gsap) return Promise.resolve(window.gsap);
  if (!gsapPromise) {
    gsapPromise = new Promise((resolve) => {
      const sc = document.createElement("script");
      sc.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
      sc.onload = () => resolve(window.gsap || null);
      sc.onerror = () => resolve(null);
      document.head.appendChild(sc);
    });
  }
  return gsapPromise;
}

export function useGsap() {
  const [g, setG] = useState(typeof window !== "undefined" ? window.gsap || null : null);
  useEffect(() => {
    let ok = true;
    loadGsap().then((x) => { if (ok && x) setG(x); });
    return () => { ok = false; };
  }, []);
  return g;
}

export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
