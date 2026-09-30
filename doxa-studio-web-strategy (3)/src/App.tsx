import { useEffect, useState } from "react";
import About from "./components/About";
import Admin from "./components/Admin";
import Contact from "./components/Contact";
import CustomCursor from "./components/CustomCursor";
import DynamicBanners from "./components/DynamicBanners";
import FloatingContact from "./components/FloatingContact";
import Footer from "./components/Footer";
import Founder from "./components/Founder";
import Hero from "./components/Hero";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Portfolio from "./components/Portfolio";
import Preloader from "./components/Preloader";
import Process from "./components/Process";
import QuoteApproval from "./components/QuoteApproval";
import Services from "./components/Services";
import Showreel from "./components/Showreel";
import Studio from "./components/Studio";
import ThemeToggle from "./components/ThemeToggle";
import { ScrollProgress } from "./components/ui";
import { initCloudSync } from "./data/cloud";
import { ensureVimeoProjectSeed } from "./data/content";
import {
  getSessionAccount,
  logout,
  type Account,
} from "./data/users";

type View = "site" | "login" | "studio" | "admin" | "quote";

function readQuoteLink() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("proforma") ?? "",
    token: params.get("token") ?? "",
  };
}

export default function App() {
  const [quoteLink] = useState(readQuoteLink);
  const [view, setView] = useState<View>(() =>
    quoteLink.id && quoteLink.token ? "quote" : "site",
  );
  const [account, setAccount] = useState<Account | null>(() =>
    getSessionAccount(),
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  /* Charge la dernière version enregistrée en ligne, si elle est
     plus récente que celle de cet appareil. */
  useEffect(() => {
    void initCloudSync().finally(() => {
      ensureVimeoProjectSeed();
    });
  }, []);

  const handleLogin = (acc: Account) => {
    setAccount(acc);
    setView("studio");
  };

  const handleLogout = () => {
    logout();
    setAccount(null);
    setView("site");
  };

  return (
    <div className="relative min-h-screen bg-ink text-white">
      <Preloader />
      <CustomCursor />
      <ScrollProgress />
      <ThemeToggle />

      {view === "site" && (
        <>
          <Navbar onStudio={() => setView(account ? "studio" : "login")} />
          <main>
            <Hero />
            <DynamicBanners position="top" />
            <Services />
            <Portfolio />
            <DynamicBanners position="middle" />
            <Showreel />
            <About />
            <Founder />
            <DynamicBanners position="bottom" />
            <Process />
            <Contact />
          </main>
          <Footer />
          <FloatingContact />
        </>
      )}

      {(view === "login" ||
        ((view === "studio" || view === "admin") && !account)) && (
        <Login onLogin={handleLogin} onBack={() => setView("site")} />
      )}

      {view === "studio" && account && (
        <Studio
          user={account}
          onLogout={handleLogout}
          onBackSite={() => setView("site")}
          onAdmin={() => setView("admin")}
        />
      )}

      {view === "admin" && account && (
        <Admin
          user={account}
          onBack={() => setView("studio")}
          onBackSite={() => setView("site")}
          onLogout={handleLogout}
        />
      )}

      {view === "quote" && quoteLink.id && quoteLink.token && (
        <QuoteApproval
          id={quoteLink.id}
          token={quoteLink.token}
          onClose={() => {
            window.history.replaceState({}, "", window.location.pathname);
            setView("site");
          }}
        />
      )}
    </div>
  );
}
