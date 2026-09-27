import { SalaryDataProvider, useSalaryDataStatus } from "./lib/SalaryDataContext";
import Nav from "./components/Nav";
import Calculator from "./components/Calculator";
import Footer from "./components/Footer";

function LoadingScreen() {
  return <p className="px-6 py-24 text-sm text-ink/50 max-w-5xl mx-auto">Loading salary and price data…</p>;
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
        <Calculator />
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
