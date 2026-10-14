import { useEffect } from "react";
import { Link } from "wouter";
import { useT } from "../../i18n/context";
import { SITE, lineHref, whatsappHref } from "../../lib/site";
import { Header } from "./nav";

export function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.26 11.26 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.65l6.04-1.58a11.3 11.3 0 0 0 5.4 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.03" />
    </svg>
  );
}
export function LineIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.37 9.86c.35 0 .63.29.63.63s-.28.63-.63.63h-1.75v1.13h1.75c.35 0 .63.28.63.63 0 .34-.28.63-.63.63h-2.38a.63.63 0 0 1-.63-.63V8.73c0-.35.28-.63.63-.63h2.38c.35 0 .63.28.63.63 0 .35-.28.63-.63.63h-1.75v1.13zm-3.85 3.02a.63.63 0 0 1-1.13.38l-2.44-3.32v2.94a.63.63 0 0 1-1.25 0V8.73a.63.63 0 0 1 1.13-.38l2.44 3.32V8.73a.63.63 0 0 1 1.25 0zm-5.73 0a.63.63 0 0 1-1.26 0V8.73a.63.63 0 0 1 1.26 0zm-2.46.63H4.95a.63.63 0 0 1-.63-.63V8.73a.63.63 0 0 1 1.26 0v3.52h1.75c.35 0 .63.28.63.63 0 .34-.28.63-.63.63M24 10.31C24 4.94 18.62.57 12 .57S0 4.94 0 10.31c0 4.81 4.27 8.84 10.04 9.6.39.09.92.26 1.06.59.12.3.08.78.04 1.09l-.17 1.02c-.05.3-.24 1.19 1.05.65 1.29-.54 6.92-4.08 9.44-6.98C23.2 14.38 24 12.45 24 10.31" />
    </svg>
  );
}

export { Header };

export function Footer() {
  const { t } = useT();
  return (
    <footer className="mt-32 border-t border-line bg-nude/60 grain">
      <div className="wrap grid gap-12 py-20 md:grid-cols-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(270px,1.7fr)] lg:gap-6 xl:gap-10">
        <div className="md:col-span-6 lg:col-span-1">
          <div className="font-serif text-[40px] font-light leading-none">Chiang Rai</div>
          <div className="eyebrow mt-2 tracking-[0.42em] text-stone">Properties</div>
          <p className="mt-8 max-w-sm text-stone">{t.home.intro}</p>
        </div>
        <div className="md:col-span-3 lg:col-span-1">
          <div className="eyebrow mb-5 text-stone">{t.menu.buy}</div>
          <ul className="space-y-2.5">
            {(["house", "condo", "land"] as const).map((k) => (
              <li key={k}>
                <Link to={`/properties?deal=sale&type=${k}`} className="hover:text-clay">
                  {t.typesPlural[k]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3 lg:col-span-1">
          <div className="eyebrow mb-5 text-stone">{t.menu.rent}</div>
          <ul className="space-y-2.5">
            {(["house", "condo", "retail", "commercial"] as const).map((k) => (
              <li key={k}>
                <Link to={`/properties?deal=rent&type=${k}`} className="hover:text-clay">
                  {t.typesPlural[k]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3 lg:col-span-1">
          <div className="eyebrow mb-5 text-stone">OTHER SERVICES</div>
          <ul className="space-y-2.5">
            <li><Link to="/consultancy" className="hover:text-clay">{t.menu.consultancy}</Link></li>
            <li><Link to="/services" className="hover:text-clay">{t.menu.findService}</Link></li>
            <li><Link to="/work-with-us" className="hover:text-clay">{t.menu.workWithUs}</Link></li>
            <li><Link to="/about" className="hover:text-clay">{t.story.title}</Link></li>
            <li><Link to="/visualiser" className="hover:text-clay">{t.nav.visualiser}</Link></li>
            <li><Link to="/list-with-us" className="hover:text-clay">{t.nav.list}</Link></li>
          </ul>
        </div>
        <div className="min-w-0 md:col-span-3 lg:col-span-1">
          <div className="eyebrow mb-5 text-stone">{t.nav.contact}</div>
          <ul className="space-y-2.5 text-stone">
            <li className="footer-email whitespace-nowrap">{SITE.email || t.contact.soon}</li>
            {SITE.phone && <li>{SITE.phone}</li>}
            <li>{SITE.address}</li>
          </ul>
        </div>
      </div>
      <div className="wrap flex flex-col justify-between gap-2 border-t border-sand py-6 text-[12px] text-stone md:flex-row">
        <span>© {new Date().getFullYear()} Chiang Rai Properties. {t.footer.rights}</span>
        <span>{t.footer.disclaimer}</span>
        <Link to="/admin" className="hover:text-ink">Admin</Link>
      </div>
    </footer>
  );
}

export function ChatButtons() {
  const { t } = useT();
  return (
    <div className="fixed right-4 bottom-20 z-30 flex flex-col gap-2 md:right-6">
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noreferrer"
        aria-label={t.chat.whatsapp}
        className="flex size-12 items-center justify-center rounded-full bg-bronze text-ink shadow-lg transition-all hover:scale-105 hover:bg-bronze-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze"
      >
        <WhatsAppIcon className="size-6" />
      </a>
      <a
        href={lineHref()}
        target="_blank"
        rel="noreferrer"
        aria-label={t.chat.line}
        className="flex size-12 items-center justify-center rounded-full bg-bronze text-ink shadow-lg transition-all hover:scale-105 hover:bg-bronze-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze"
      >
        <LineIcon className="size-6" />
      </a>
    </div>
  );
}

/** Scrolls to #hash targets (waiting for the page to render) and to the top on page changes. */
function useScrollManager() {
  useEffect(() => {
    let lastPath = window.location.pathname;
    let timer: ReturnType<typeof setTimeout> | undefined;
    function toHash(id: string, smooth: boolean, tries = 0) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
        return;
      }
      if (tries < 30) timer = setTimeout(() => toHash(id, smooth, tries + 1), 60);
    }
    function onNav() {
      clearTimeout(timer);
      const path = window.location.pathname;
      const samePage = path === lastPath;
      lastPath = path;
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (hash) {
        if (!samePage) window.scrollTo(0, 0);
        timer = setTimeout(() => toHash(hash, samePage), samePage ? 0 : 80);
      } else if (!samePage) {
        window.scrollTo(0, 0);
      }
    }
    if (window.location.hash) toHash(decodeURIComponent(window.location.hash.slice(1)), false);
    const events = ["pushState", "replaceState", "popstate", "hashchange"];
    for (const e of events) window.addEventListener(e, onNav);
    return () => {
      clearTimeout(timer);
      for (const e of events) window.removeEventListener(e, onNav);
    };
  }, []);
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  useScrollManager();
  return (
    <div className="satin-copper-site min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
      <ChatButtons />
    </div>
  );
}
