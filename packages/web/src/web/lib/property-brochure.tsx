import { Font, pdf } from "@react-pdf/renderer";
import type { Listing } from "../queries/listings";
import { Brochure, validateBrochure } from "../../shared/brochure";

Font.register({ family: "BrochureBody", src: "/fonts/NotoSansThai.ttf" });
Font.register({ family: "BrochureDisplay", src: "/fonts/CormorantGaramond.ttf" });
async function pdfImage(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Image unavailable");
  const bitmap = await createImageBitmap(await response.blob());
  const canvas = document.createElement("canvas");
  const ratio = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.round(bitmap.width * ratio); canvas.height = Math.round(bitmap.height * ratio);
  const context = canvas.getContext("2d")!; context.fillStyle = "#FFFFFF"; context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.94);
}
export async function generatePropertyBrochure(l: Listing, sample = false) {
  validateBrochure(l);
  const logo = await pdfImage("/images/official-badge.png");
  const photos = await Promise.all(l.imageUrls.slice(0, 12).map((url) => pdfImage(url).catch(() => null)));
  const plan = l.floorPlanUrl ? await pdfImage(l.floorPlanUrl).catch(() => null) : null;
  const blob = await pdf(<Brochure l={l} media={{ logo, photos, plan }} sample={sample} />).toBlob();
  return { blob, missingMedia: photos.some((p) => !p) || Boolean(l.floorPlanUrl && !plan) };
}