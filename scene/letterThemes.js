/* letterThemes.js
   The five color themes for the letter reveal (scene/LetterUnfoldDemo.jsx).
   Picked once in the compose form and saved onto the letter forever, so this
   file is imported by both the compose UI and the reveal itself.

   Only colours live here. The petal shapes are the exact original SVG paths
   from the uploaded file -- each theme just substitutes different hex values
   into the same gradient stops, verified to match structurally when this was
   built (see the build log: shapes confirmed byte-identical across themes). */

const ROSE_HEXES = [
  ["e6005c", "ff2a75", "ff80ab", "ffd6e5", "ffffff", "ff80ab"],
  ["ff1a66", "ff4d88", "ff99bb", "ffe6f0", "ffffff"],
  ["d6004b", "ff3377", "ffb3d1", "ffe6f0"],
  ["ff3385", "ff99c2", "fff0f5"],
];

/* the exact original data-URI templates, unchanged from the uploaded file */
const PETAL_URL_TEMPLATES = [
  `data:image/svg+xml,%3Csvg viewBox='0 0 100 120' width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='p1' cx='50%25' cy='85%25' r='85%25'%3E%3Cstop offset='0%25' stop-color='%23e6005c'/%3E%3Cstop offset='45%25' stop-color='%23ff2a75'/%3E%3Cstop offset='85%25' stop-color='%23ff80ab'/%3E%3Cstop offset='100%25' stop-color='%23ffd6e5' stop-opacity='0.95'/%3E%3C/radialGradient%3E%3CradialGradient id='hl1' cx='35%25' cy='30%25' r='60%25'%3E%3Cstop offset='0%25' stop-color='%23ffffff' stop-opacity='0.45'/%3E%3Cstop offset='50%25' stop-color='%23ff80ab' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpath d='M50 115 C 28 112, 6 85, 10 52 C 14 28, 32 8, 50 6 C 68 8, 86 28, 90 52 C 94 85, 72 112, 50 115 Z' fill='url(%23p1)'/%3E%3Cpath d='M50 115 C 28 112, 6 85, 10 52 C 14 28, 32 8, 50 6 C 68 8, 86 28, 90 52 C 94 85, 72 112, 50 115 Z' fill='url(%23hl1)'/%3E%3C/svg%3E`,
  `data:image/svg+xml,%3Csvg viewBox='0 0 90 120' width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='p2' x1='0' y1='0.8' x2='1' y2='0.2'%3E%3Cstop offset='0%25' stop-color='%23ff1a66'/%3E%3Cstop offset='40%25' stop-color='%23ff4d88'/%3E%3Cstop offset='80%25' stop-color='%23ff99bb'/%3E%3Cstop offset='100%25' stop-color='%23ffe6f0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M45 110 C 20 100, 5 70, 15 40 C 22 20, 38 5, 55 12 C 72 18, 82 45, 75 75 C 68 98, 55 108, 45 110 Z' fill='url(%23p2)'/%3E%3Cpath d='M25 45 C 38 25, 60 22, 70 38 C 55 50, 35 55, 25 45 Z' fill='%23ffffff' opacity='0.35'/%3E%3C/svg%3E`,
  `data:image/svg+xml,%3Csvg viewBox='0 0 110 110' width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='p3' cx='50%25' cy='85%25' r='85%25'%3E%3Cstop offset='0%25' stop-color='%23d6004b'/%3E%3Cstop offset='50%25' stop-color='%23ff3377'/%3E%3Cstop offset='88%25' stop-color='%23ffb3d1'/%3E%3Cstop offset='100%25' stop-color='%23ffe6f0' stop-opacity='0.9'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpath d='M55 102 C 30 100, 5 75, 8 48 C 10 25, 32 8, 48 16 C 52 18, 58 18, 62 16 C 78 8, 100 25, 102 48 C 105 75, 80 100, 55 102 Z' fill='url(%23p3)'/%3E%3C/svg%3E`,
  `data:image/svg+xml,%3Csvg viewBox='0 0 70 90' width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='p4' cx='50%25' cy='85%25' r='85%25'%3E%3Cstop offset='0%25' stop-color='%23ff3385'/%3E%3Cstop offset='60%25' stop-color='%23ff99c2'/%3E%3Cstop offset='100%25' stop-color='%23fff0f5' stop-opacity='0.85'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpath d='M35 85 C 20 83, 5 62, 8 40 C 10 22, 22 8, 35 6 C 48 8, 60 22, 62 40 C 65 62, 50 83, 35 85 Z' fill='url(%23p4)'/%3E%3C/svg%3E`,
];

const SIZE_META = [
  { sizeRange: [65, 115], restOp: [0.85, 1], floatDurRange: [12, 20], shadow: true },
  { sizeRange: [50, 95], restOp: [0.8, 0.98], floatDurRange: [10, 18], shadow: true },
  { sizeRange: [55, 105], restOp: [0.8, 0.95], floatDurRange: [11, 19], shadow: true },
  { sizeRange: [30, 60], restOp: [0.7, 0.9], floatDurRange: [8, 14], shadow: false },
];

export const LETTER_THEMES = {
  rose: {
    label: "Rose", swatch: "#ff80ab",
    page: ["#f6dbe6", "#f0c3d6"],
    petals: [
      ["e6005c", "ff2a75", "ff80ab", "ffd6e5", "ffffff", "ff80ab"],
      ["ff1a66", "ff4d88", "ff99bb", "ffe6f0", "ffffff"],
      ["d6004b", "ff3377", "ffb3d1", "ffe6f0"],
      ["ff3385", "ff99c2", "fff0f5"],
    ],
    bubble: { mid: "255,182,193", outer: "255,105,180", edge: "219,39,119", shadow: "236,72,153" },
    glow: "230,0,92",
  },
  ocean: {
    label: "Ocean", swatch: "#26a69a",
    page: ["#d4eef0", "#a3d8de"],
    petals: [
      ["00695c", "26a69a", "80cbc4", "e0f2f1", "ffffff", "80cbc4"],
      ["00838f", "26c6da", "80deea", "e0f7fa", "ffffff"],
      ["004d40", "00897b", "80cbc4", "e0f2f1"],
      ["0097a7", "4dd0e1", "e0f7fa"],
    ],
    bubble: { mid: "128,222,234", outer: "38,166,154", edge: "0,105,92", shadow: "0,131,143" },
    glow: "0,131,143",
  },
  sage: {
    label: "Sage", swatch: "#8bc34a",
    page: ["#dceed4", "#b9d9a8"],
    petals: [
      ["33691e", "689f38", "aed581", "f1f8e9", "ffffff", "aed581"],
      ["558b2f", "8bc34a", "c5e1a5", "f1f8e9", "ffffff"],
      ["2e7d32", "66bb6a", "a5d6a7", "e8f5e9"],
      ["7cb342", "aed581", "f1f8e9"],
    ],
    bubble: { mid: "197,225,165", outer: "139,195,74", edge: "51,105,30", shadow: "85,139,47" },
    glow: "85,139,47",
  },
  lavender: {
    label: "Lavender", swatch: "#ab47bc",
    page: ["#e6ddf2", "#c9b3e6"],
    petals: [
      ["5e35b1", "9575cd", "d1c4e9", "f3e9ff", "ffffff", "d1c4e9"],
      ["6a1b9a", "ab47bc", "e1bee7", "f8e9ff", "ffffff"],
      ["4527a0", "7e57c2", "d1c4e9", "ede7f6"],
      ["8e24aa", "ce93d8", "fce4ff"],
    ],
    bubble: { mid: "225,190,231", outer: "171,71,188", edge: "74,20,140", shadow: "106,27,154" },
    glow: "106,27,154",
  },
  honey: {
    label: "Honey", swatch: "#e6941a",
    page: ["#fbeacb", "#f0cf8e"],
    petals: [
      ["a85c00", "e6941a", "ffcc70", "fff3d6", "ffffff", "ffcc70"],
      ["c17900", "f0a83a", "ffd699", "fff6e0", "ffffff"],
      ["8a4a00", "d4881f", "ffcf80", "fff3d6"],
      ["e08e00", "ffca66", "fff6e6"],
    ],
    bubble: { mid: "255,214,153", outer: "230,148,26", edge: "138,74,0", shadow: "193,121,0" },
    glow: "193,121,0",
  },
};

export const THEME_ORDER = ["rose", "ocean", "sage", "lavender", "honey"];

/* builds the petalTypes array for a given theme: same shapes, sizes and
   timing as the original, only the colour stops swapped */
export function petalTypesFor(themeKey) {
  const theme = LETTER_THEMES[themeKey] || LETTER_THEMES.rose;
  return PETAL_URL_TEMPLATES.map((tmpl, i) => {
    let url = tmpl;
    const fromHexes = ROSE_HEXES[i];
    const toHexes = theme.petals[i];
    for (let j = 0; j < fromHexes.length; j++) {
      url = url.split(`%23${fromHexes[j]}`).join(`%23${toHexes[j]}`);
    }
    return { ...SIZE_META[i], url };
  });
}
