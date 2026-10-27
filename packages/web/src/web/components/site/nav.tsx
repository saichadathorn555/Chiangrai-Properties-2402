import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { ArrowRight, ChevronDown, Menu, Minus, Plus, X } from "lucide-react";
import { useT } from "../../i18n/context";
import { TYPE_KEYS } from "../../i18n/dict";
import { FounderPortrait } from "./founder-portrait";

type MenuKey = "property" | "consult" | "service" | "work" | "about";
type MenuLink = { to: string; t: string; d?: string };
// Restore when service offerings launch; keeps the underlying page/menu definition intact.
const SERVICE_NAV_VISIBLE = false;

function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useT();
  return (
    <div className={`eyebrow flex items-center gap-2 ${className}`}>
      <button onClick={() => setLang("en")} aria-pressed={lang === "en"} className={lang === "en" ? "text-ink" : "text-stone hover:text-ink"}>
        EN
      </button>
      <span className="text-sand" aria-hidden>
        |
      </span>
      <button onClick={() => setLang("th")} aria-pressed={lang === "th"} className={lang === "th" ? "text-ink" : "text-stone hover:text-ink"}>
        TH
      </button>
    </div>
  );
}

function Wordmark() {
  return (
    <Link to="/" className="group flex flex-col items-start leading-none" aria-label="Chiang Rai Properties — Home">
      <img src="/images/logo-chiangrai-terracotta.png" alt="Chiangrai Properties" width={668} height={668} className="size-[116px] object-contain md:size-[140px]" />
    </Link>
  );
}

/** Builds every menu from the dictionary so desktop and mobile stay in sync. */
function useMenus() {
  const { t } = useT();
  const m = t.menu;
  const sale: MenuLink[] = (["house", "condo", "land"] as const).map((k) => ({ to: `/properties?deal=sale&type=${k}`, t: t.typesPlural[k] }));
  const rent: MenuLink[] = TYPE_KEYS.filter((k) => k !== "apartment").map((k) => ({ to: `/properties?deal=rent&type=${k}`, t: t.typesPlural[k] }));
  const services: MenuLink[] = t.services.items.map((s) => ({ to: `/services#${s.id}`, t: s.t, d: s.tags.slice(0, 2).join(" · ") }));

  const items: { key: MenuKey; label: string; to: string; desc: string; links: MenuLink[]; image: string; all?: MenuLink }[] = [
    { key: "property", label: m.findProperty, to: "/properties", desc: m.findPropertyDesc, links: [], image: "/images/mockup-cafe.jpg" },
    { key: "consult", label: m.consultancy, to: "/consultancy", desc: m.consultancyDesc, links: m.consultLinks, image: "/images/consult.jpg" },
    {
      key: "service",
      label: m.findService,
      to: "/services",
      desc: m.findServiceDesc,
      links: services,
      image: "/images/commercial-2.jpg",
      all: { to: "/services", t: m.allServices },
    },
    { key: "work", label: m.workWithUs, to: "/work-with-us", desc: m.workWithUsDesc, links: m.workLinks, image: "/images/retail-1.jpg" },
    { key: "about", label: m.aboutUs, to: "/about", desc: m.aboutUsDesc, links: m.aboutLinks, image: "/images/founder.jpg" },
  ];
  return { items: SERVICE_NAV_VISIBLE ? items : items.filter((item) => item.key !== "service"), sale, rent };
}

export function Header() {
  const { t } = useT();
  const m = t.menu;
  const { items, sale, rent } = useMenus();
  const [active, setActive] = useState<MenuKey | null>(null);
  const [mobile, setMobile] = useState(false);
  const [loc] = useLocation();
  const path = loc;
  const headerRef = useRef<HTMLElement>(null);

  const close = () => {
    setActive(null);
    setMobile(false);
  };

  useEffect(() => {
    setActive(null);
    setMobile(false);
  }, [loc]);

  // Esc closes everything; clicking outside closes the desktop panel.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActive(null);
        setMobile(false);
      }
    }
    function onDown(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setActive(null);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const current = items.find((i) => i.key === active);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur" onMouseLeave={() => setActive(null)}>
      <div className="wrap flex items-center justify-between gap-6 py-3 lg:items-stretch lg:py-0">
        <div className="flex items-center lg:py-4">
          <Wordmark />
        </div>

        {/* Mobile: language + burger */}
        <div className="flex items-center gap-5 lg:hidden">
          <LangToggle />
          <button onClick={() => setMobile(true)} aria-label="Open menu" aria-expanded={mobile}>
            <Menu className="size-6" strokeWidth={1.25} />
          </button>
        </div>

        {/* Desktop: utility row + main row, right-aligned */}
        <div className="hidden flex-col items-end justify-between lg:flex">
          <div className="flex items-center gap-5 pt-3.5 text-[12px] text-stone">
            <span className="hidden xl:inline">{t.tagline}</span>
            <span className="hidden h-3 w-px bg-sand xl:block" aria-hidden />
            <Link to="/list-with-us" onClick={close} className="hover:text-ink">
              {t.nav.list}
            </Link>
            <span className="h-3 w-px bg-sand" aria-hidden />
            <LangToggle />
          </div>
          <nav aria-label="Main">
            <ul className="flex items-center gap-x-5 xl:gap-x-9">
              {items.map((it) => {
                const isOpen = active === it.key;
                const isHere = path === it.to || (it.key === "property" && path.startsWith("/propert"));
                return (
                  <li key={it.key} className="relative" onMouseEnter={() => setActive(it.key)}>
                    <div className="flex items-center">
                      <Link to={it.to} onClick={close} aria-current={isHere ? "page" : undefined} className={`navtop block focus-visible:outline-1 focus-visible:outline-bronze ${isOpen || isHere ? "text-clay" : "text-ink"}`}>{it.label}</Link>
                      <button type="button" aria-label={`Toggle ${it.label} menu`} aria-expanded={isOpen} aria-controls="mega-panel" onClick={() => setActive(isOpen ? null : it.key)} className="ml-1 grid min-h-11 w-7 place-items-center text-clay focus-visible:outline-1 focus-visible:outline-clay"><ChevronDown className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} /></button>
                    </div>
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-clay transition-transform duration-300 ${isOpen ? "scale-x-100" : "scale-x-0"}`}
                    />
                  </li>
                );
              })}
              <li className="relative" onMouseEnter={() => setActive(null)}>
                <Link to="/contact" onClick={close} className={`navtop block ${path === "/contact" ? "text-clay" : "text-ink"}`}>
                  {m.contact}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Tablet & phone: the same top-level bar, horizontally scrollable */}
      <nav aria-label="Sections" className="no-scrollbar overflow-x-auto border-t border-line lg:hidden">
        <ul className="wrap flex w-max min-w-full items-center justify-between gap-x-6">
          {[...items.map((i) => ({ to: i.to, label: i.label, key: i.key })), { to: "/contact", label: m.contact, key: "contact" }].map((i) => {
            const here = path === i.to || (i.key === "property" && path.startsWith("/propert"));
            return (
              <li key={i.key}>
                <Link to={i.to} className={`navtop block py-3.5 ${here ? "text-clay" : "text-ink"}`}>
                  {i.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop mega panel */}
      {current && (
        <div id="mega-panel" className="mega-in absolute inset-x-0 top-full hidden border-y border-line bg-paper shadow-[0_30px_60px_-30px_rgba(42,37,34,0.18)] lg:block">
          <div className="wrap grid grid-cols-12 gap-10 py-10">
            <div className="col-span-3 pr-4">
              <p className="eyebrow text-clay">{m.explore}</p>
              <Link to={current.to} onClick={close} className="mt-3 block font-serif text-[34px] leading-tight hover:text-clay">
                {current.label}
              </Link>
              <p className="mt-3 text-[14px] leading-relaxed text-stone">{current.desc}</p>
              {current.key === "property" ? (
                <div className="mt-6 flex flex-col items-start gap-3">
                  <PanelCta to="/properties?deal=sale" label={m.allSale} onClick={close} />
                  <PanelCta to="/properties?deal=rent" label={m.allRent} onClick={close} />
                </div>
              ) : (
                <div className="mt-6">
                  <PanelCta to={current.all?.to ?? current.to} label={current.all?.t ?? current.label} onClick={close} />
                </div>
              )}
            </div>

            {current.key === "property" ? (
              <>
                <TypeColumn title={m.buy} links={sale} onClick={close} />
                <TypeColumn title={m.rent} links={rent} onClick={close} />
              </>
            ) : (
              <ul className={`col-span-6 grid content-start gap-x-10 border-l border-line pl-10 ${current.key === "service" ? "grid-cols-3 gap-y-5" : "grid-cols-2 gap-y-7"}`}>
                {current.links.map((l) => (
                  <li key={l.to + l.t}>
                    <Link to={l.to} onClick={close} className="group block">
                      <span className={`font-serif leading-tight transition-colors group-hover:text-clay ${current.key === "service" ? "text-[19px]" : "text-[22px]"}`}>
                        {l.t}
                      </span>
                      {l.d && <span className="mt-1 block text-[12.5px] text-stone">{l.d}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="col-span-3">
              {current.key === "property" ? (
                <Link to="/visualiser" onClick={close} className="group block">
                  <div className="aspect-[4/3] overflow-hidden bg-nude">
                    <img src={current.image} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <p className="mt-4 font-serif text-[22px] leading-tight group-hover:text-clay">{m.visualiserTitle}</p>
                  <p className="mt-1 text-[13px] text-stone">{m.visualiserDesc}</p>
                </Link>
              ) : current.key === "about" ? (
                <div className="flex aspect-[4/3] items-center justify-center bg-nude/60">
                  <FounderPortrait className="w-[55%]" />
                </div>
              ) : (
                <div className="aspect-[4/3] overflow-hidden bg-nude">
                  <img
                    src={current.image}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobile &&
        createPortal(
        <nav className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-paper lg:hidden" aria-label="Mobile menu">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <LangToggle />
            <button onClick={() => setMobile(false)} aria-label="Close menu">
              <X className="size-6" strokeWidth={1.25} />
            </button>
          </div>
          <div className="flex-1 px-6 pb-16">
            {items.map((it) => (
              <MobileSection key={it.key} label={it.label} to={it.to} onNavigate={close}>
                {it.key === "property" ? (
                  <div className="grid grid-cols-2 gap-6">
                    <MobileGroup title={m.buy} links={[{ to: "/properties?deal=sale", t: m.allSale }, ...sale]} onClick={close} />
                    <MobileGroup title={m.rent} links={[{ to: "/properties?deal=rent", t: m.allRent }, ...rent]} onClick={close} />
                    <Link to="/visualiser" onClick={close} className="col-span-2 flex items-center justify-between border-t border-line pt-4 text-clay">
                      {t.nav.visualiser} <ArrowRight className="size-4" />
                    </Link>
                  </div>
                ) : (
                  <MobileGroup links={[...(it.key === "service" ? [{ to: "/services", t: m.allServices }] : []), ...it.links]} onClick={close} />
                )}
              </MobileSection>
            ))}
            <Link to="/contact" onClick={close} className="display block border-b border-line py-5 text-[30px]">
              {m.contact}
            </Link>
            <Link to="/list-with-us" onClick={close} className="btn-ink mt-10 w-full">
              {t.nav.list}
            </Link>
          </div>
        </nav>,
          document.body,
        )}
    </header>
  );
}

function PanelCta({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="eyebrow inline-flex items-center gap-2 border-b border-ink pb-1 hover:border-clay hover:text-clay">
      {label} <ArrowRight className="size-3.5" />
    </Link>
  );
}

function TypeColumn({ title, links, onClick }: { title: string; links: MenuLink[]; onClick: () => void }) {
  return (
    <div className="col-span-3 border-l border-line pl-10">
      <p className="eyebrow text-stone">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} onClick={onClick} className="group flex items-center justify-between font-serif text-[22px] leading-tight hover:text-clay">
              {l.t}
              <ArrowRight className="size-3.5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileSection({ label, to, onNavigate, children }: { label: string; to: string; onNavigate: () => void; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <div className="flex items-center justify-between gap-3">
        <Link to={to} onClick={onNavigate} className="display min-w-0 flex-1 py-5 text-[30px] focus-visible:outline-1 focus-visible:outline-bronze">{label}</Link>
        <button type="button" onClick={() => setOpen(!open)} aria-label={`Toggle ${label} submenu`} aria-expanded={open} className="grid size-11 shrink-0 place-items-center focus-visible:outline-1 focus-visible:outline-bronze">
          {open ? <Minus className="size-5 text-clay" strokeWidth={1.25} /> : <Plus className="size-5" strokeWidth={1.25} />}
        </button>
      </div>
      {open && <div className="pb-6">{children}</div>}
    </div>
  );
}

function MobileGroup({ title, links, onClick }: { title?: string; links: MenuLink[]; onClick: () => void }) {
  return (
    <div>
      {title && <p className="eyebrow mb-3 text-clay">{title}</p>}
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.to + l.t}>
            <Link to={l.to} onClick={onClick} className="block text-[16px] text-ink/85 hover:text-clay">
              {l.t}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
