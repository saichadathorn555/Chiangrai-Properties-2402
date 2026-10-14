import { useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { authClient, signOut } from "../../lib/auth";
import { useSetup } from "../../queries/setup";
import AdminListings from "./listings";
import ListingForm from "./listing-form";
import AdminInquiries from "./inquiries";
import AdvisorDirectory from "./advisors";

function AuthScreen({ firstRun }: { firstRun: boolean }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = firstRun
      ? await authClient.signUp.email({ name: name || "Owner", email, password })
      : await authClient.signIn.email({ email, password });
    setBusy(false);
    if (res.error) {
      setError(res.error.message ?? "Something went wrong");
      return;
    }
    await qc.invalidateQueries();
    window.location.reload();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-nude/60 px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-paper p-10 shadow-[0_30px_80px_-40px_rgba(42,37,34,0.35)]">
        <p className="eyebrow text-stone">Chiang Rai Properties</p>
        <h1 className="display mt-3 text-4xl">{firstRun ? "Create owner account" : "Admin sign in"}</h1>
        {firstRun && (
          <p className="mt-3 text-sm text-stone">
            No admin exists yet. The first account created becomes the owner; sign-up closes afterwards.
          </p>
        )}
        <div className="mt-8 space-y-5">
          {firstRun && (
            <div>
              <span className="label">Name</span>
              <input className="field" aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div>
            <span className="label">Email</span>
            <input className="field" aria-label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <span className="label">Password</span>
            <input
              className="field"
              aria-label="Password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <button className="btn-ink mt-8 w-full" disabled={busy}>
          {busy ? "Please wait…" : firstRun ? "Create account" : "Sign in"}
        </button>
        <a href="/" className="eyebrow mt-6 block text-center text-stone hover:text-ink">
          ← Back to site
        </a>
      </form>
    </div>
  );
}

function Shell({ email, children }: { email: string; children: React.ReactNode }) {
  const [loc] = useLocation();
  const tab = (to: string, label: string) => {
    const active = to === "/" ? loc === "/" || loc.startsWith("/listings") : loc.startsWith(to);
    return (
      <Link to={to} className={`eyebrow pb-1 ${active ? "border-b border-ink text-ink" : "text-stone hover:text-ink"}`}>
        {label}
      </Link>
    );
  };
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-2xl font-light">Chiang Rai Properties</span>
            <span className="eyebrow text-clay">Admin</span>
          </div>
          <nav className="flex flex-wrap items-center gap-5">
            {tab("/", "Listings")}
            {tab("/advisors", "Advisors")}
            {tab("/inquiries", "Inquiries & bookings")}
            <a href="/" className="eyebrow text-stone hover:text-ink">View site ↗</a>
          </nav>
          <div className="flex items-center gap-4 text-sm text-stone">
            <span className="hidden md:inline">{email}</span>
            <button
              className="eyebrow text-ink underline decoration-clay underline-offset-4"
              onClick={async () => {
                await signOut();
                window.location.reload();
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="wrap py-10">{children}</main>
    </div>
  );
}

export default function AdminApp() {
  const session = authClient.useSession();
  const setup = useSetup();

  if (session.isPending || setup.isPending) {
    return <div className="grid min-h-screen place-items-center text-stone">Loading…</div>;
  }
  if (!session.data) return <AuthScreen firstRun={setup.data?.hasAdmin === false} />;

  return (
    <Shell email={session.data.user.email}>
      <Switch>
        <Route path="/" component={AdminListings} />
        <Route path="/listings/new">{() => <ListingForm key="new" id={null} />}</Route>
        <Route path="/listings/:id">{(p) => <ListingForm key={p.id} id={Number(p.id)} />}</Route>
        <Route path="/inquiries" component={AdminInquiries} />
        <Route path="/advisors" component={AdvisorDirectory} />
      </Switch>
    </Shell>
  );
}
