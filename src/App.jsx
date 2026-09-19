import { SalaryDataProvider, useSalaryDataStatus } from "./lib/SalaryDataContext";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Calculator from "./components/Calculator";
import TopMajors from "./components/TopMajors";
import Footer from "./components/Footer";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-4">
        <span className="w-3 h-3 rounded-full bg-moss animate-pulse" />
        <p className="text-sm text-ink/50">Loading salary data…</p>
      </div>
    </div>
  );
}

function ErrorScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <p className="text-sm text-ink/60 max-w-sm text-center">
        Couldn't load the salary data. Try refreshing the page.
      </p>
    </div>
  );
}

function Page() {
  const { ready, error } = useSalaryDataStatus();
  if (error) return <ErrorScreen />;
  if (!ready) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />
      <main>
        <Hero />
        <Calculator />
        <TopMajors />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <SalaryDataProvider>
      <Page />
    </SalaryDataProvider>
  );
}

export default App;
