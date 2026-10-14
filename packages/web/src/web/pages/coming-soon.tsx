import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

function BrandMark() {
  return (
    <img src="/images/official-badge.png" alt="Chiangrai Properties" className="launch-logo border-0! object-contain" />
  );
}

function Clock() {
  return (
    <div className="launch-clock-scene">
      <div className="launch-clock-orbit" aria-hidden />
      <svg viewBox="0 0 480 480" className="launch-clock" aria-label="Minimal gold clock showing 1:15 PM">
        <title>Minimal gold clock showing 1:15 PM</title>
        <defs>
          <radialGradient id="clock-face" cx="35%" cy="25%" r="85%">
            <stop offset="0%" stopColor="#fffdf9" />
            <stop offset="65%" stopColor="#f5ece1" />
            <stop offset="100%" stopColor="#e9daca" />
          </radialGradient>
          <linearGradient id="clock-rim" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#dfcc9e" />
            <stop offset="45%" stopColor="#a78950" />
            <stop offset="75%" stopColor="#eee1be" />
            <stop offset="100%" stopColor="#a78950" />
          </linearGradient>
        </defs>
        <circle cx="240" cy="240" r="219" fill="url(#clock-rim)" />
        <circle cx="240" cy="240" r="214" fill="url(#clock-face)" />
        <circle cx="240" cy="240" r="208" fill="none" stroke="#c5aa79" strokeWidth="0.65" opacity="0.65" />
        {Array.from({ length: 60 }, (_, i) => (
          <line key={i} x1="240" y1="49" x2="240" y2={i % 5 === 0 ? "62" : "54"}
            transform={`rotate(${i * 6} 240 240)`} stroke={i % 5 === 0 ? "#a78950" : "#cbbba7"} strokeWidth={i % 5 === 0 ? "1.6" : "0.7"} />
        ))}
        <g fill="#8c7455" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="29" textAnchor="middle">
          <text x="240" y="97">12</text>
          <text x="392" y="250">3</text>
          <text x="240" y="403">6</text>
          <text x="88" y="250">9</text>
        </g>
        <text x="240" y="163" fill="#a0907b" fontFamily="Figtree, sans-serif" fontSize="8" letterSpacing="3" textAnchor="middle">CHIANGRAI</text>
        <text x="240" y="177" fill="#a0907b" fontFamily="Figtree, sans-serif" fontSize="6.5" letterSpacing="2.5" textAnchor="middle">PROPERTIES</text>
        {/* 1:15: hour is a quarter of the way from 1 to 2, not exactly at 1. */}
        <line data-hand="hour" x1="240" y1="250" x2="240" y2="129" transform="rotate(37.5 240 240)" stroke="#806443" strokeWidth="5" strokeLinecap="round" />
        <line data-hand="minute" x1="240" y1="255" x2="240" y2="98" transform="rotate(90 240 240)" stroke="#a78950" strokeWidth="3" strokeLinecap="round" />
        <circle cx="240" cy="240" r="8" fill="#a78950" />
        <circle cx="240" cy="240" r="3.3" fill="#f8f0df" />
      </svg>
    </div>
  );
}

export default function ComingSoonPage() {
  const [submitted] = useState(() => new URLSearchParams(window.location.search).get("subscribed") === "1");
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    document.title = "Coming Soon — Chiangrai Properties";
    document.documentElement.lang = "en";
  }, []);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    if (!consent || pending) {
      e.preventDefault();
      return;
    }
    // Let the browser POST directly; Web3Forms redirects only after success.
    setPending(true);
  }

  return (
    <main className="launch-page">
      <div className="launch-wash" aria-hidden />
      <Clock />
      <div className="launch-shell">
        <header className="launch-header">
          <BrandMark />
        </header>

        <section className="launch-hero" aria-labelledby="launch-title">
          <div className="launch-hero-copy">
            <p className="launch-eyebrow">Homes · Spaces · Land</p>
            <h1 id="launch-title">COMING <span>SOON</span></h1>
            <div className="launch-hero-foot"><span aria-hidden /> Chiang Rai, Thailand</div>
          </div>
        </section>

        <section className="launch-lower" aria-label="Launch updates">
          <div className="launch-message">
            <span className="launch-eyebrow">Something good is taking shape</span>
            <h2>We are almost ready<br />to Launch!</h2>
            <p>Thoughtful places. Honest advice.<br />A fresh perspective on Chiang Rai.</p>
          </div>
          <div className="launch-signup">
            <h2>Join our Mailing List</h2>
            <p className="launch-signup-intro">Be the first to know when we open our doors.</p>
            {submitted ? (
              <output className="launch-success" aria-live="polite"><Check className="size-5 shrink-0" /><span><strong>Thank you for subscribing!</strong><span className="mt-1 block">We’ll be in touch when we launch.</span></span></output>
            ) : (
              <form action="https://api.web3forms.com/submit" method="POST" onSubmit={submit}>
                <input type="hidden" name="access_key" value="f3d9f0fe-6bbf-479c-9201-1642181f28fe" />
                <input type="hidden" name="redirect" value={`${window.location.origin}/?subscribed=1`} />
                <input type="hidden" name="subject" value="New mailing-list subscriber — Chiangrai Properties" />
                <input type="hidden" name="from_name" value="Chiangrai Properties" />
                <label htmlFor="launch-email" className="launch-email-label">Email *</label>
                <div className="launch-email-row">
                  <input id="launch-email" aria-label="Email *" name="email" type="email" autoComplete="email" required maxLength={254}
                    placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button type="submit" disabled={pending}>
                    {pending ? <><Loader2 className="size-4 animate-spin" /> Subscribing</> : <>Subscribe <ArrowRight className="size-4" strokeWidth={1.2} /></>}
                  </button>
                </div>
                <label className="launch-consent" htmlFor="launch-consent">
                  <input id="launch-consent" aria-label="Yes, subscribe me to your newsletter. *" name="consent" value="Yes, subscribe me to your newsletter." type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>Yes, subscribe me to your newsletter. *</span>
                </label>
                <div className="launch-honeypot" aria-hidden="true">
                  <label htmlFor="launch-website">Leave this empty</label>
                  <input id="launch-website" aria-label="Leave this empty" name="botcheck" type="checkbox" tabIndex={-1} />
                </div>
                <p className="launch-privacy">Your email will be used for launch news and our newsletter only.</p>
              </form>
            )}
          </div>
        </section>

        <footer className="launch-footer">
          <span>© {new Date().getFullYear()} Chiangrai Properties</span>
          <span>Real estate, with a personal perspective.</span>
        </footer>
      </div>
    </main>
  );
}