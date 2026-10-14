/** Official contact destinations verified from the supplied business QR assets. */
export const SITE = {
  email: "contact@chiangrai-properties.com",
  phone: "+66 98 848 8190",
  whatsappUrl: "https://wa.me/message/VF42IE2KL6I2O1?src=qr",
  lineUrl: "https://line.me/R/ti/p/@743omtwi",
  address: "Chiang Rai, Thailand",
};

export function whatsappHref(text?: string) {
  const url = new URL(SITE.whatsappUrl);
  if (text) url.searchParams.set("text", text);
  return url.toString();
}
export function lineHref() {
  return SITE.lineUrl;
}
