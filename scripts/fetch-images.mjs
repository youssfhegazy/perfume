/* One-off asset fetcher: pulls the placeholder photography set from Unsplash
   into public/images. Re-run with `node scripts/fetch-images.mjs`. */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ID = {
  // bottles
  "bottle-oud-box": "1608828201325-cfc4c1cc6ef9",
  "bottle-oud-beads": "1608828201317-ce72715cb12a",
  "bottle-oud-forest": "1642698215110-87817f1fbe0e",
  "bottle-oud-shelf": "1640869116016-93c00ba94b28",
  "bottle-blue-bloom": "1700665053090-e64274eeba84",
  "bottle-garnet": "1785357693688-5329ad1840a9",
  // atelier
  "atelier-hands": "1709661878954-17dbe48004a0",
  "atelier-row": "1709660274775-75c47120ec0c",
  "atelier-gloved": "1709661878949-204870c2e169",
  "atelier-clear": "1709662217788-6a8a1b31562a",
  "bottles-1": "1543422655-ac1c6ca993ed",
  "bottles-2": "1595425959632-34f2822322ce",
  "bottles-4": "1594125311687-3b1b3eafa9f4",
  "bottles-8": "1588405748880-12d1d2a59f75",
  "bottles-9": "1672848700906-2b8ca62639e4",
  "bottles-10": "1615108395437-df128ad79e80",
  "bottles-13": "1608528577891-eb055944f2e7",
  "bottles-14": "1582211594533-268f4f1edcb9",
  "flat-2": "1645105234123-1ace9e851f72",
  "saffron-0": "1560076649-950a9ef4a860",
  "rose-1": "1541724673942-6b2993cf1c81",
  "rose-3": "1615423525118-a7e9ede8b680",
  "rose-5": "1542804316-b35a2c2a055c",
  "fig-0": "1540927550647-43699cb14916",
  "fig-1": "1598286565846-993596aa4af6",
  "fig-2": "1663742163165-49e1a1534493",
  "fig-5": "1518977877150-35db786d223a",
  "fig-6": "1637346162074-af1391419f4f",
  "amberres-0": "1782192496614-d2e98e5f96e0",
  "amberres-3": "1666557389078-fb9bffc09a9a",
  "amberres-5": "1780619692141-9a13fbc39782",
  "agar-0": "1636978669347-ebc543a814f3",
  "spice-1": "1509358271058-acd22cc93898",
  "spice-4": "1616319708901-52d9b189d74c",
  "spice-7": "1656001901235-7f4fcf73ee5a",
  "citrus-0": "1678663648809-78b5ce491c78",
  "citrus-1": "1776634249625-c17c87594efd",
  "citrus-2": "1769508854021-13e87c5c99ed",
  "citrus-6": "1693206145366-fc60d1fc983d",
  "white-0": "1486639107311-064febaff1c5",
  "white-2": "1660481354975-32a730024654",
  "white-4": "1554656546-249b3cf64e15",
  "white-6": "1692521726977-f5c42456e716",
  "wood-0": "1702001145743-094b0b7ead51",
  "vanilla-1": "1610487512810-b614ad747572",
  "vanilla-2": "1682482198446-4cbf92f85a4b",
  "smoke-1": "1627809381019-976c0d1adc98",
  "smoke-3": "1627769916425-74c2344a3439",
  "leather-0": "1571829604981-ea159f94e5ad",
  "marble-6": "1516541196182-6bdb0516ed27",
  "teal-0": "1533748347742-b2e2ff602786",
  "teal-2": "1570552957726-dab5f25d71ad",
  "teal-4": "1518640467707-6811f4a6ab73",
  "silk-1": "1606259457945-67dc66271ee6",
  "silk-2": "1619043518800-7f14be467dca",
  "silk-3": "1732869415090-179de017b6d6",
  "pear-4": "1625821748286-57fdb2cd5920",
};

/** [outPath, candidateKey, width, height] */
const JOBS = [
  // hero + editorial bands
  ["hero/hero-wide.jpg", "bottles-9", 1920, 1080],
  ["hero/hero-portrait.jpg", "bottles-9", 1200, 1500],
  ["hero/story.jpg", "atelier-hands", 1400, 1400],
  ["bg/pearl.jpg", "marble-6", 1920, 1080],
  ["bg/abyss.jpg", "teal-0", 1920, 1080],
  ["bg/newsletter.jpg", "silk-3", 1920, 900],
  ["bg/editorial.jpg", "teal-4", 1920, 1080],
  ["bg/smoke.jpg", "smoke-3", 1920, 1080],
  ["og.jpg", "bottles-9", 1200, 630],
];

// per-product gallery: packshot, angled, with box, macro
const GALLERY = {
  oud: ["bottle-oud-box", "bottle-oud-beads", "bottle-oud-shelf", "bottle-oud-forest"],
  rose: ["bottles-2", "bottles-10", "bottles-1", "rose-5"],
  amber: ["bottles-8", "atelier-row", "atelier-gloved", "amberres-3"],
  vetiver: ["bottle-blue-bloom", "bottles-4", "atelier-clear", "fig-1"],
  musk: ["flat-2", "bottles-14", "atelier-clear", "white-2"],
  saffron: ["bottle-garnet", "bottles-13", "saffron-0", "smoke-3"],
};
for (const [id, keys] of Object.entries(GALLERY)) {
  JOBS.push([`products/${id}.jpg`, keys[0], 1200, 1500]);
  keys.forEach((k, i) => JOBS.push([`products/${id}-${i}.jpg`, k, 800, 1000]));
}

// home "the notes we work with" gallery (1:1)
for (const [n, k] of [
  ["saffron", "saffron-0"],
  ["rose", "rose-3"],
  ["agarwood", "agar-0"],
  ["fig", "fig-2"],
]) {
  JOBS.push([`notes/gallery-${n}.jpg`, k, 900, 900]);
}

// scent-pyramid note wells (4:5, small)
const NOTES = {
  saffron: "saffron-0",
  "pink-pepper": "spice-7",
  agarwood: "agar-0",
  leather: "leather-0",
  sandalwood: "wood-0",
  amber: "amberres-3",
  bergamot: "citrus-2",
  lychee: "citrus-6",
  "taif-rose": "rose-3",
  peony: "white-4",
  musk: "silk-1",
  patchouli: "fig-0",
  cardamom: "spice-1",
  mandarin: "citrus-1",
  labdanum: "amberres-0",
  benzoin: "amberres-5",
  vanilla: "vanilla-1",
  tonka: "vanilla-2",
  lime: "citrus-0",
  papyrus: "fig-5",
  vetiver: "fig-6",
  "fig-leaf": "fig-2",
  cedar: "wood-0",
  ambrette: "white-0",
  aldehydes: "teal-2",
  pear: "pear-4",
  iris: "white-6",
  "cotton-flower": "white-2",
  "white-musk": "silk-2",
  cashmeran: "silk-3",
  rose: "rose-1",
  oud: "bottle-oud-forest",
  myrrh: "smoke-3",
  incense: "smoke-1",
  cinnamon: "spice-4",
};
for (const [n, k] of Object.entries(NOTES)) {
  JOBS.push([`notes/${n}.jpg`, k, 256, 320]);
}

const ROOT = path.resolve("public/images");
const cache = new Map();

function source(key) {
  if (cache.has(key)) return cache.get(key);
  const id = ID[key];
  if (!id) throw new Error(`no id for ${key}`);
  const p = (async () => {
    const r = await fetch(
      `https://images.unsplash.com/photo-${id}?w=2400&q=85&fm=jpg`,
    );
    if (!r.ok) throw new Error(`${key}: HTTP ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  })();
  cache.set(key, p);
  return p;
}

let ok = 0;
let failed = 0;
for (const [out, key, w, h] of JOBS) {
  const dest = path.join(ROOT, out);
  try {
    const buf = await source(key);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await sharp(buf)
      .resize(w, h, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(dest);
    ok++;
  } catch (e) {
    failed++;
    console.error("FAIL", out, e.message);
  }
}

await fs.writeFile(
  path.join(ROOT, "CREDITS.md"),
  [
    "# Image credits",
    "",
    "Placeholder photography for the Maison Oud build. Sourced from Unsplash under the",
    "Unsplash License (https://unsplash.com/license) and re-cropped for this layout.",
    "Replace all of it with the real shoot before launch - the art direction is in",
    "design_handoff_maison_oud/DESIGN.md.",
    "",
    "| slot | unsplash photo |",
    "| --- | --- |",
    ...Object.entries(ID).map(
      ([k, id]) => `| ${k} | https://unsplash.com/photos/${id} |`,
    ),
    "",
  ].join("\n"),
);

console.log(`done: ${ok} written, ${failed} failed, ${JOBS.length} jobs`);
