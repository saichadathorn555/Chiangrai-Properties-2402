import { inquiryFieldName } from "../../inquiry-fields";

export type InquiryNotification = {
  kind: "listing" | "contact" | "list-property" | "consultation" | "service" | "partner";
  name: string;
  email: string;
  phone?: string;
  message: string;
  listingId?: number;
  meta: Record<string, string>;
};

const sources = {
  contact: { name: "Contact Us", subject: "New Inquiry from Contact Us" },
  consultation: { name: "Consultancy Form", subject: "New Request from Consultancy Form" },
  partner: { name: "Join Us", subject: "New Application from Join Us" },
  listing: { name: "Property Inquiry", subject: "New Inquiry from Property Inquiry" },
  "list-property": { name: "List Your Property", subject: "New Application from List Your Property" },
  service: { name: "Service Request", subject: "New Request from Service Request" },
} as const;

export function inquiryEmailPayload(input: InquiryNotification) {
  const source = sources[input.kind];
  if (input.kind === "consultation") {
    // Explicit allowlist: seven customer rows, never a combined name or metadata summary.
    const metaValue = (...keys: string[]) => {
      for (const key of keys) if (key in input.meta) return input.meta[key] || "Not provided";
      return "Not provided";
    };
    return {
      _subject: `[Chiangrai Properties] ${source.subject}`,
      _template: "table",
      _captcha: "false",
      _replyto: input.email,
      _honey: "",
      Name: metaValue("first_name", "Name") === "Not provided" ? input.name : metaValue("first_name", "Name"),
      Surname: metaValue("surname", "Surname"),
      Email: input.email,
      Phone: input.phone || "Not provided",
      "Requested Service": metaValue("service", "Requested Service", "Service"),
      "Maximum Budget (THB)": metaValue("maximum_budget", "Maximum Budget (THB)", "budget", "Budget", "Budget (THB, optional)"),
      Message: input.message || "Not provided",
    };
  }
  const payload: Record<string, string> = {
    _subject: `[Chiangrai Properties] ${source.subject}`,
    _template: "table",
    _captcha: "false",
    _replyto: input.email,
    _honey: "",
    "Form Source": source.name,
    "Full Name": input.name,
    "Email Address": input.email,
    "Phone Number": input.phone || "Not provided",
    ...(input.listingId ? { "Property ID": String(input.listingId) } : {}),
    Message: input.message || "Not provided",
  };
  for (const [label, value] of Object.entries(input.meta)) {
    if (/^(Notification|Submission[ _]ID|Submitted[ _]Details)/i.test(label) || label.trim().startsWith("_")) continue;
    // Use the same readable field names as the HTML; never duplicate core rows or controls.
    const key = inquiryFieldName(label);
    if (!key || key in payload) continue;
    payload[key] = value || "Not provided";
  }
  return payload;
}

export async function notifyInquiry(input: InquiryNotification) {
  const response = await fetch("https://formsubmit.co/ajax/contact@chiangrai-properties.com", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Origin: "https://www.chiangrai-properties.com", Referer: "https://www.chiangrai-properties.com/" },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify(inquiryEmailPayload(input)),
  });
  const result: unknown = await response.json();
  if (!response.ok || !result || typeof result !== "object" || !("success" in result) || (result.success !== true && result.success !== "true")) {
    throw new Error("FormSubmit did not accept the enquiry notification. Inbox activation may be required.");
  }
  return { acceptedAt: new Date().toISOString() };
}