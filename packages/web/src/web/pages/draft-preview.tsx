import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { authClient } from "../lib/auth";
import ComingSoonPage from "./coming-soon";

const DraftSite = lazy(() => import("../draft-site"));

export default function DraftPreview({ copper = false }: { copper?: boolean }) {
  const session = authClient.useSession();
  const [location] = useLocation();
  if (!import.meta.env.DEV && session.isPending) return <div className="p-12">Loading…</div>;
  if (!import.meta.env.DEV && !session.data) return <ComingSoonPage />;
  return <div className={copper && location === "/" ? "copper-approval-preview" : undefined}><div className="border-b border-line bg-nude px-6 py-2 text-center text-xs text-stone">Draft preview — the public site remains Coming Soon.</div><Suspense fallback={<div className="p-12">Loading…</div>}><DraftSite /></Suspense></div>;
}