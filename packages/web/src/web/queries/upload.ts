import { client } from "../lib/api";

type Kind = "listing" | "customer";

/** Presign + PUT an image to storage. Returns the stored ref (`s3:<key>`). */
export async function uploadImage(file: File, kind: Kind) {
  const input = { filename: file.name, contentType: file.type };
  const { url, ref } =
    kind === "listing" ? await client.upload.presignListing(input) : await client.upload.presignCustomer(input);
  const res = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return ref;
}
