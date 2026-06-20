import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public/assets/items");
const SOURCE = path.join(ROOT, "corn-seed-icon.png");

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  const l = (max + min) / 2;

  if (delta === 0) return { h: 0, s: 0, l };

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  if (max === rn) h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / delta + 2) / 6;
  else h = ((rn - gn) / delta + 4) / 6;

  return { h, s, l };
}

function hslToRgb(h, s, l) {
  if (s === 0) {
    const gray = Math.round(l * 255);
    return [gray, gray, gray];
  }

  const hueToRgb = (p, q, t) => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    Math.round(hueToRgb(p, q, h) * 255),
    Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  ];
}

function shiftPixel(r, g, b, a, options) {
  if (a < 8) return [r, g, b, a];

  if (r > 235 && g > 235 && b > 235) {
    return [r, g, b, a];
  }

  const { h: baseH, s: baseS, l: baseL } = rgbToHsl(r, g, b);

  if (baseS < 0.08) {
    return [r, g, b, a];
  }

  const targetHue = options.targetHue / 360;
  const mix = options.mix;
  const saturationBoost = options.saturationBoost;
  const lightnessAdjust = options.lightnessAdjust;

  const h = baseH * (1 - mix) + targetHue * mix;
  const s = Math.min(1, baseS * saturationBoost);
  const l = Math.min(1, Math.max(0, baseL + lightnessAdjust));

  const [nr, ng, nb] = hslToRgb(h, s, l);
  return [nr, ng, nb, a];
}

async function buildVariant(outputName, options) {
  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.from(data);

  for (let i = 0; i < out.length; i += 4) {
    const shifted = shiftPixel(out[i], out[i + 1], out[i + 2], out[i + 3], options);
    out[i] = shifted[0];
    out[i + 1] = shifted[1];
    out[i + 2] = shifted[2];
    out[i + 3] = shifted[3];
  }

  await sharp(out, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png()
    .toFile(path.join(ROOT, outputName));

  console.log(`Wrote ${outputName}`);
}

await buildVariant("corn-seed-rare.png", {
  targetHue: 215,
  mix: 0.72,
  saturationBoost: 1.35,
  lightnessAdjust: -0.02,
});

await buildVariant("corn-seed-epic.png", {
  targetHue: 295,
  mix: 0.78,
  saturationBoost: 1.45,
  lightnessAdjust: 0.01,
});

console.log("Seed icon variants generated.");
