import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import sharp from "sharp";
import {
  Brochure,
  validateBrochure,
  type BrochureListing,
} from "../../shared/brochure";
import { getObjectBytes, putObject } from "./s3";

const publicRoot = resolve(import.meta.dirname, "../../../public");
let fontsRegistered = false;
async function image(ref: string) {
  let bytes: Uint8Array;
  if (ref.startsWith("s3:listings/"))
    bytes = (await getObjectBytes(ref.slice(3))).bytes;
  else if (ref.startsWith("/images/")) {
    const path = resolve(publicRoot, ref.slice(1));
    if (!path.startsWith(publicRoot + sep))
      throw new Error("Invalid media path");
    bytes = await readFile(path);
  } else throw new Error("Use uploaded listing images, not external URLs.");
  if (bytes.byteLength > 20 * 1024 * 1024)
    throw new Error("Image exceeds the 20 MB limit.");
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
export async function publishBrochure(
  l: BrochureListing & {
    id: number;
    revision: number;
    images: string[];
    floorPlanImage: string | null;
  },
) {
  validateBrochure(l);
  if (!fontsRegistered) {
    Font.register({
      family: "BrochureBody",
      src: resolve(publicRoot, "fonts/NotoSansThai.ttf"),
    });
    Font.register({
      family: "BrochureDisplay",
      src: resolve(publicRoot, "fonts/CormorantGaramond.ttf"),
    });
    fontsRegistered = true;
  }
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
  const buffer = await renderToBuffer(
    <Brochure l={l} media={{ logo, photos, plan }} sample={false} />,
  );
  const key = `brochures/${l.id}/r${l.revision}-${crypto.randomUUID()}.pdf`;
  await putObject(key, buffer, "application/pdf");
  return `s3:${key}`;
}
