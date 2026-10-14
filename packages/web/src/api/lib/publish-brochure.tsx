import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import type * as ReactPdf from "@react-pdf/renderer";
import type SharpModule from "sharp";
import {
  Brochure,
  configureBrochureFonts,
  validateBrochure,
  type BrochureListing,
} from "../../shared/brochure";
import { getObjectBytes, putObject } from "./s3";

// The production server is bundled into a single server.js. PDFKit (used by
// @react-pdf/renderer) resolves its standard fonts through package-private
// "#standard-fonts/*" imports relative to its own file, and react-pdf loads
// them as soon as it is imported. Bundled, those lookups run relative to
// server.js, fail, and crash the process at boot. Loading the renderer (and
// sharp's native binding) from node_modules at publish time keeps both in
// their own package scope. A non-literal specifier keeps the bundler from
// inlining them.
function loadExternal<T>(specifier: string): Promise<T> {
  return import(specifier) as Promise<T>;
}
let renderer: Promise<typeof ReactPdf> | null = null;
let sharpModule: Promise<typeof SharpModule> | null = null;
let fontsRegistered = false;
async function loadRenderer() {
  renderer ??= loadExternal<typeof ReactPdf>("@react-pdf/renderer");
  const pdf = await renderer;
  if (!fontsRegistered) {
    const root = assetRoot();
    configureBrochureFonts(pdf.Font, {
      body: resolve(root, "fonts/NotoSansThai.ttf"),
      display: resolve(root, "fonts/CormorantGaramond.ttf"),
    });
    fontsRegistered = true;
  }
  return pdf;
}
async function loadSharp() {
  sharpModule ??= loadExternal<{ default: typeof SharpModule }>("sharp").then(
    (m) => m.default,
  );
  return sharpModule;
}

// Static assets live in packages/web/public in development (this file is
// src/api/lib) and in dist/, next to the bundled src/server.js, in production.
const REQUIRED_ASSETS = [
  "fonts/NotoSansThai.ttf",
  "fonts/CormorantGaramond.ttf",
  "images/official-badge.png",
];
let cachedAssetRoot: string | null = null;
function assetRoot() {
  if (cachedAssetRoot) return cachedAssetRoot;
  const here = import.meta.dirname;
  const candidates = [
    resolve(here, "../../../public"),
    resolve(here, "../dist"),
    resolve(here, "../public"),
    resolve(process.cwd(), "dist"),
    resolve(process.cwd(), "public"),
    resolve(process.cwd(), "packages/web/public"),
  ];
  const found = candidates.find((dir) =>
    REQUIRED_ASSETS.every((asset) => existsSync(resolve(dir, asset))),
  );
  if (!found)
    throw new Error(
      `Brochure assets not found (looked in ${candidates.join(", ")}).`,
    );
  cachedAssetRoot = found;
  return found;
}

async function image(ref: string) {
  let bytes: Uint8Array;
  if (ref.startsWith("s3:listings/"))
    bytes = (await getObjectBytes(ref.slice(3))).bytes;
  else if (ref.startsWith("/images/")) {
    const root = assetRoot();
    const path = resolve(root, ref.slice(1));
    if (!path.startsWith(root + sep)) throw new Error("Invalid media path");
    bytes = await readFile(path);
  } else throw new Error("Use uploaded listing images, not external URLs.");
  if (bytes.byteLength > 20 * 1024 * 1024)
    throw new Error("Image exceeds the 20 MB limit.");
  const sharp = await loadSharp();
  const jpg = await sharp(bytes, { limitInputPixels: 60_000_000 })
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 94 })
    .toBuffer();
  return `data:image/jpeg;base64,${jpg.toString("base64")}`;
}

export type BrochureInput = BrochureListing & {
  id: number;
  revision: number;
  images: string[];
  floorPlanImage: string | null;
};

/** Renders the brochure PDF for a listing without storing it. */
export async function renderBrochurePdf(l: BrochureInput) {
  validateBrochure(l);
  const { renderToBuffer } = await loadRenderer();
  const logo = await image("/images/official-badge.png");
  // Fail publication on broken supplied media, rather than publish a partial PDF.
  const photos: string[] = [];
  for (let start = 0; start < l.images.length; start += 4) {
    const batch = await Promise.all(
      l.images.slice(start, start + 4).map(image),
    );
    for (const [i, photo] of batch.entries())
      if (start + i < 12) photos.push(photo);
  }
  const plan = l.floorPlanImage ? await image(l.floorPlanImage) : null;
  return renderToBuffer(
    <Brochure l={l} media={{ logo, photos, plan }} sample={false} />,
  );
}

export async function publishBrochure(l: BrochureInput) {
  const buffer = await renderBrochurePdf(l);
  const key = `brochures/${l.id}/r${l.revision}-${crypto.randomUUID()}.pdf`;
  await putObject(key, buffer, "application/pdf");
  return `s3:${key}`;
}
