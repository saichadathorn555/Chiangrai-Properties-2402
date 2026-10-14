import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import AdminApp from "./pages/admin";
import ComingSoonPage from "./pages/coming-soon";
import DraftPreview from "./pages/draft-preview";
import { Provider } from "./components/provider";
import { I18nProvider } from "./i18n/context";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";
import { COMING_SOON } from "../site-mode";

const DraftSite = lazy(() => import("./draft-site"));

function App() {
  return (
    <Provider>
      <I18nProvider>
        <Switch>
          <Route path="/admin" nest component={AdminApp} />
          <Route path="/copper-preview" nest>{() => <DraftPreview copper />}</Route>
          <Route path="/draft" nest>{() => <DraftPreview />}</Route>
          <Route>{() => import.meta.env.DEV ? <DraftPreview /> : COMING_SOON ? <ComingSoonPage /> : <Suspense fallback={<div className="p-12">Loading…</div>}><DraftSite /></Suspense>}</Route>
        </Switch>
      </I18nProvider>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
