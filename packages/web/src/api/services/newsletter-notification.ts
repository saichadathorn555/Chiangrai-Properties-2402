export const newsletterFormAction = "https://formsubmit.co/contact@chiangrai-properties.com";

// FormSubmit's documented JSON endpoint keeps the visitor on the Coming Soon page.
const endpoint = newsletterFormAction.replace("formsubmit.co/", "formsubmit.co/ajax/");

export async function notifyNewsletter(email: string, consentText: string, recordedAt: string) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: "https://www.chiangrai-properties.com",
      Referer: "https://www.chiangrai-properties.com/",
    },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      email,
      name: "Newsletter subscriber",
      message: "New mailing-list signup from the Chiangrai Properties Coming Soon page.",
      consent: consentText,
      consent_recorded_at: recordedAt,
      source: "https://www.chiangrai-properties.com/",
      _subject: "New mailing-list subscriber — Chiangrai Properties",
      _template: "table",
      _captcha: "false",
      _honey: "",
    }),
  });
  const result: unknown = await response.json();
  if (!response.ok || !result || typeof result !== "object" || !("success" in result)
    || (result.success !== true && result.success !== "true")) {
    throw new Error("FormSubmit did not accept the notification.");
  }
  // Acceptance is not a delivery receipt; inbox activation is still required.
  return { acceptedAt: new Date().toISOString() };
}