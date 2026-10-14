import { Route, Switch } from "wouter";
import Index from "./pages/index";
import PropertiesPage from "./pages/properties";
import PropertyPage from "./pages/property";
import ConsultancyPage from "./pages/consultancy";
import VisualiserPage from "./pages/visualiser";
import AboutPage from "./pages/about";
import ContactPage from "./pages/contact";
import ListWithUsPage from "./pages/list-with-us";
import ServicesPage from "./pages/services";
import WorkWithUsPage from "./pages/work-with-us";
import { SiteLayout } from "./components/site/layout";

function NotFound() {
  return (
    <section className="wrap py-40 text-center">
      <p className="eyebrow text-stone">404</p>
      <h1 className="display mt-4 text-5xl">Page not found</h1>
      <a href="/" className="btn-line mt-10">Home</a>
    </section>
  );
}

export default function DraftSite() {
  return (
    <SiteLayout>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/properties" component={PropertiesPage} />
        <Route path="/property/:id" component={PropertyPage} />
        <Route path="/consultancy" component={ConsultancyPage} />
        <Route path="/visualiser" component={VisualiserPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/list-with-us" component={ListWithUsPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/work-with-us" component={WorkWithUsPage} />
        <Route component={NotFound} />
      </Switch>
    </SiteLayout>
  );
}

