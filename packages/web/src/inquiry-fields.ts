// Shared by the HTML controls and server-generated FormSubmit notification table.
const fieldNames: Record<string, string> = {
  name: "Full Name",
  full_name: "Full Name",
  first_name: "Full Name",
  email: "Email Address",
  email_address: "Email Address",
  "e-mail address": "Email Address",
  phone: "Phone Number",
  phone_number: "Phone Number",
  service: "Requested Service",
  requested_service: "Requested Service",
  date: "Preferred Date",
  preferred_date: "Preferred Date",
  budget: "Budget",
  "budget (thb, optional)": "Budget",
  message: "Message",
  full_message: "Message",
  surname: "Surname",
  subject: "Subject",
  country: "Country",
  country_code: "Country Code",
  category: "Category",
  interest: "Category",
  "i'm interested in": "Category",
  company: "Company",
  "company / profession (optional)": "Company",
  website: "Website",
  "website or profile link (optional)": "Website",
  when: "Preferred Timing",
  intent: "Listing Intent",
  ptype: "Property Type",
  location: "Location",
  size: "Size",
  expected: "Expected Price",
  property_id: "Property ID",
  form_source: "Form Source",
};

export function inquiryFieldName(key: string): string {
  const normalized = key.trim().toLowerCase();
  return fieldNames[normalized] ?? fieldNames[normalized.replace(/\s+/g, "_")] ?? key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}