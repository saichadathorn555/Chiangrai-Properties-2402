# Chiang Rai Properties — Design System

Mood: est living editorial calm (quiet luxury, generous whitespace, thin rules, light serif display) in a warm palette.

## Critical layout correction — supersedes earlier nowrap rules
- Consultancy and Join Us Thai hero titles use exactly 32px with normal wrapping, keep-all/strict Thai line breaking, 1.4 line height, and bounded min-width:0 columns. Remove full-row/nowrap/container-size title overrides. Restore heading-left/description-right 8/4 grid with 40px gap at md+, stacked with gap on phones.
- Explicit short Thai phrase units preserve เรื่อง intact; only phrase units are nonbreaking, never the entire heading. English typography remains unchanged. Apartment remains absent from Rent navigation in EN/TH; no data/type deletion or publication.

## Corrective Thai title / apartment navigation revision
- Thai consultancy title gets an additional 20% reduction from the latest size: min(base × 0.54, 4.8cqw), full-width single line. Explicit local language attribute and inline nowrap make the text constraint independent of document language timing. English and other headings unchanged.
- Remove apartment from header Rent type lists for both desktop/mobile and EN/TH; do not remove stored listings, CMS type support or general search filters. Keep other Rent categories intact. No publication.

## Final pre-publication revisions — approved
- Floating WhatsApp opens the exact official Business URL without a prefilled-message parameter, with the same new-tab anchor behavior as LINE.
- Homepage Buy dropdown and desktop/mobile navigation Buy type lists contain only Home/House, Condo and Land in EN/TH. Rent/Stay and general property filters remain unchanged.
- Thai consultancy title stays one intact line with normal Thai text (เรื่อง is not split). Thai-only full-width heading row, nowrap and container-responsive scaling: 10% smaller than its current Thai size where it fits, shrinking further on narrow screens without clipping or horizontal overflow. English layout/typography unchanged. No publication or launch-flag changes.

## Approved contact, Thai heading and footer refinement
- Contact social links form one row: Facebook, Instagram, LinkedIn and icon-only WhatsApp; identical 40px targets, 23px icons, 12px gaps and bronze styling. Preserve accessible names and official destinations.
- Translated page titles and main section headings use responsive font-size variables; Thai sizes are exactly 75% of existing sizes at every breakpoint. English headings, body text, navigation, CMS and Coming Soon remain unchanged. English fallback listing titles stay full size.
- Footer Buy contains Houses, Condos, Land; Rent contains Houses, Condos, Retail Spaces, Commercial Spaces. Rename Studio to OTHER SERVICES, retaining its links. Widen Contact's desktop column and keep email unbroken, with a narrow-phone-only font reduction if needed. Preserve colors, forms and launch protection.

## Satin copper — approved main-site styling
- /copper-preview reuses the exact existing homepage/header content and geometry, including the left-aligned logo (user confirmed no relocation). No text, dimensions, spacing, fonts, navigation destinations, forms or page context changes.
- Main SiteLayout now uses the full-width #F0E6D8 satin-copper finish, radial center #F8F0E5 fading through #F0E6D8 to #E2D2BE, faint horizontal brushing. Header shares this finish on all website pages. Existing logo artwork and text use solid bold Burnt Terracotta #7E2E18 with truly transparent background; geometry/lettering and size unchanged, fine strokes strengthened.
- Existing Buy/Rent/Stay filter rectangle uses soft Champagne Bronze Tint #EADBC8, retaining all dimensions. Tab labels remain warm terracotta #B54A2A at weight 500; dropdown panels and all other surfaces stay unchanged. Only italic hero headline accent uses #B54A2A; body text and other UI keep existing colors.
- Styling is applied to the normal website, not just /copper-preview. Existing section fills, text, layout, interactions and body colors remain; public Coming Soon and CMS remain unchanged. /copper-preview remains a compatible alias for reviewing the same main-site styling.

## Colors
- `--paper` #FBF8F4 warm white (page background)
- `--nude` #EFE6DC nude (section fills)
- `--sand` #E2D3C3 beige (borders on dark, tags)
- `--peach` #F3D9C8 light peach (accent fills, hover, highlights)
- `--clay` #B88B6E muted terracotta (tiny accents: active dots, links underline)
- `--ink` #2A2522 warm near-black (text, not action fills)
- `--bronze` #B89270 signature luxury bronze (solid actions); `--bronze-hover` #A78060. Ink labels provide readable contrast on bronze; white is reserved for the darker scan-safe bronze #806044 QR artwork.
- `--stone` #7D736B secondary text
- `--line` #E5DCD2 hairlines

## Typography
- Display: Cormorant Garamond 300/400 (EN), Noto Serif Thai 300/400 (TH). Big, light, tight leading (1.05).
- Body/UI: Figtree 400/500 (EN), Noto Sans Thai (TH).
- Eyebrow / nav: 11–12px uppercase, letter-spacing 0.18em, Figtree 500.

## Layout
- Max width 1360px, 24px gutter mobile / 48px desktop.
- Sections separated by 1px hairlines and 96–160px vertical space.
- Asymmetric splits (7/5, 5/7). Images edge-to-edge inside their column, no rounded corners (radius 0–2px).
- Cards: image 4:3, eyebrow (FOR SALE · CONDO), serif title, thin rule, specs row (beds · baths · sqm).

## Components
- Buttons: square, signature bronze fill with ink text, or bronze hairline outline. Uppercase tracked label; visible bronze keyboard focus. No black filled action controls, including galleries, active filters and CMS submissions. Dark photo-viewer backgrounds remain unchanged.
- Inputs: bottom-border only on paper, or 1px line boxes in forms.
- Header: centered serif wordmark, small tracked nav, top utility bar (EN/TH, WhatsApp/LINE).
- All top-level header labels are immediate page links: Find a Property → /properties, Consultancy → /consultancy, Join Us → /work-with-us, About Us → /about. Hover mega-menus and separate accessible toggles retain optional secondary navigation; mobile accordion headings also navigate, with a separate expand control.
- No carousels. Single static hero.

## Draft homepage transaction filters
- Header uses the supplied circular gold badge, cropped without changing the artwork; 116px mobile / 140px desktop (about 45% larger), with comfortable 12–16px vertical clearance.
- Compact editorial introduction: exact English headline “Your trusted partner for fine homes, land & spaces in Chiang Rai”, 20px mobile / 38px desktop, around 38% smaller; reduce hero top padding and headline/intro gaps by about 40%. Supporting copy stays legible at 14px with tight 1.45 leading.
- Buy / Rent / Stay is the primary hero action: 18–20px medium-weight tabs, generous 72px targets and spacing, warm-light background, clay active underline, larger chevrons and clear hover/focus/open states. Dropdowns stay light with thin borders and a soft shadow.
- No “Choose a property type” subtitle or empty reserved row beneath transaction tabs (English or Thai). Only a selected type displays the compact feedback/Clear type row.
- Buy: Home, Condo, Land. Rent: Home, Condo, Retail, Commercial Space. Stay: House, Condo only.
- Selection updates the homepage property query and results context; Home maps to house, Buy to sale, Rent to rent and Stay to its independent stay transaction. Explicit loading, empty and error states.
- Public Coming Soon remains unchanged. /draft preview is available in development; deployed preview requires an authenticated session and existing draft APIs remain protected.

## Motion
- One staggered fade-up on page load (`.reveal` with delays). Image hover: slow 1.03 scale.

## About page
- Main ABOUT US is a direct /about link; hover retains the mega-menu, with a separate keyboard-accessible toggle. My story links to /about.
- Cohesive left profile sidebar: circular portrait 54% of column width (25% smaller than 72%), followed immediately by Sai Chadathorn and FOUNDER & CEO. Right-column My story heading at 28.8/36.8/48px (20% smaller than 36/46/60px), no category label or italic lead.
- Preserve editorial body copy and quote; remove the seasonal-flooding/title-verification clause. Bold only the founding-gap phrase, with the remainder of that sentence regular weight.

## Consultancy and pre-launch navigation
- Temporarily hide Find a Service across desktop header, tablet section strip and mobile menu using a reversible navigation flag; preserve service pages and footer links.
- Consultation request left panel is text-only. Six form rows: equal Name/Surname boxes, E-mail, integrated flag/country-prefix phone default Thailand +66 matching Contact, full-width SERVICE, full-width MAXIMUM BUDGET (THB), Message. No preferred date or meeting format. Seven exact service choices including Owners wording and Others last.
- Consultation controls and notification rows use exactly Name, Surname, Email, Phone, Requested Service, Maximum Budget (THB), Message; no combined Full Name or duplicate metadata rows in this notification. Other forms retain their existing mapping. Request consultation uses #B89270 bronze with white text and darker bronze hover.

## Contact page
- CONTACT heading in muted bronze #C3A38A; subtitle is subtle 16px body typography, with no reply-time promise.
- Clean vertical left column: official +66 98 848 8190 telephone link, email, supplied official 3×3cm LINE QR in scan-safe dark bronze with white quiet zone, linked to https://line.me/R/ti/p/@743omtwi; thin bronze Facebook/Instagram/LinkedIn placeholder links followed by a clean bronze WhatsApp Business icon. Business destination decoded from supplied asset: https://wa.me/message/VF42IE2KL6I2O1?src=qr. Global chat widgets use bronze and these same official destinations.
- Right column: equal Name/Surname boxes, full-width E-mail, integrated flag/country-dial selector default Thailand +66 with phone input, exact five-option Subject selector, Message, Submit Enquiry.
- Paper/light neutral boxed fields, 16px text, fine warm borders and bronze focus indication. Desktop two-column layout, stacked on phones; Name/Surname remain equal side-by-side. Preserve existing typed enquiry API and pre-launch access protection, combine names and retain surname/subject/country metadata without changing schema.

## Enquiry submission feedback
- Customer enquiry controls and outgoing FormSubmit table keys use exact readable names: Full Name, Email Address, Phone Number, Requested Service, Preferred Date, Budget, Message. Other fields have distinct readable names; Contact retains its separate Surname box and combines both names for the Full Name email row. Honeypot name is _honey. No default name/email or Submitted Details keys in enquiry notifications; provider reply-to control retained separately. The separate Web3Forms newsletter keeps its provider-required fields.
- All enquiry forms share the exact inline confirmation: “Thank you for reaching out! We have received your request and will get back to you shortly.” Show only after provider acceptance, not just database save; keep values on failure and allow retry.
- Public submit endpoint forwards via server-side FormSubmit to contact@chiangrai-properties.com with source-specific subject, full structured fields and message. Keep protected listing/admin/AI endpoints unchanged. Save enquiries before notification, record provider status, deduplicate accepted retries by per-form submission ID, add honeypot/rate limits.

## Units
- Living/floor space and residential plot surfaces in m². Land-only listings display ตารางวา (stored sqm / 4). Prices THB with thousands separator; rent shows "/ month", Stay "/ night". Editor accepts plot sqm or Rai (1 Rai = 1,600 sqm).

## Property specifications and map/plan
- Luxury detail redesign: restrained reference-led title left/THB price right, full-width high-resolution carousel, thumbnail strip and accessible all-photos dialog. Editorial PROPERTY DETAILS left with LOCATION directly below, floorplan retained separately; right KEY INFORMATION hairline table, circular dedicated advisors, outline brochure and dark contact CTA. Missing data labelled Not provided; no fabricated views, furnishing, images or plans.
- Editable per-listing primary/co-advisor profiles (name, Property Advisor/Founder & CEO, uploaded avatar), views and furnishing. Unassigned properties use Sai Chadathorn / Founder & CEO. Existing owner/draft protections preserved.
- Four-page A4 brochure: repeated logo left and approved company/location/email/web block right; page 1 title/THB, summary, specs, full description; pages 2–3 six-cell photo grids; page 4 contained floorplan. Reference/page footer and concise indicative-details disclaimer. Only real stored photos, explicit missing states, preview watermark for samples. No currency conversion.
- Shared inline 1.25px Lucide wireframe icons: bed, bath with faucet, diagonal square dimension, land plot. Separate living and plot area, never suppress plot when floor space exists. Omit missing values, preserve zero.
- Below description: light-beige two-column MAP / FLOORPLAN container, uppercase Figtree headers, equal-height map and object-contain schematic; stacked on mobile.
- Bottom-right floorplan search/zoom control opens a focus-managed native dialog with 100–400% zoom, scroll/pan, reset and Escape close.
- Optional validated latitude/longitude pair positions Google Maps; missing pair uses district/province query clearly labelled approximate, never invents coordinates.

## Back-office CMS and publishing
- Extend existing owner-only /admin with warm paper/ink editorial dashboard, summary counts, search, transaction/publication filters and reusable advisor directory. No template switch or public launch.
- Save Draft → Preview → Publish. Published records alone populate search/meta/similar; owner can preview drafts directly. Saving edits withdraws publication until explicit republish. Server validates media and generates/stores the four-A4-page PDF before publishing; failure leaves draft intact. Listing revision binds brochure to the published content.
- True Buy (stored sale), Rent and Stay with monthly/nightly price units. Shared THB formatter supports numeric, Price on request (redacted API price), Starting from and Negotiable across cards/details/PDF. Legacy Apartment preserved.
- Reference suggestion CR-001 onwards with manual override and unique server enforcement; sqm/Rai editor conversion; first ordered photo is hero, explicit make-hero and reorder controls; reusable advisor dropdowns up to two, name/portrait/position from directory.

## Pre-launch landing page
- Standalone public Coming Soon page; hide main navigation, property listings, contact widgets and founder sections. Retain all draft files.
- Cream paper #FBF8F4, pale peach atmospheric wash, muted gold #A78950 circular double-ring wordmark. No stock photos or generated media.
- Single-screen landscape composition (like an A4 landscape poster): bold centered one-line COMING SOON, oversized low-contrast gold clock behind the title, fixed at 1:15 PM (hour hand 37.5°, minute hand 90° from twelve).
- Bold lower-left launch message and lower-middle newsletter form, exact requested labels and explicit required consent. Viewport-height responsive grid puts every section in view without scrolling; compact stacked lower sections on phones. Remove the two decorative phrases requested by the user.
