import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Explorer from "./components/Explorer";
import TopMajors from "./components/TopMajors";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />
      <main>
        <Hero />
        <Explorer />
        <TopMajors />
      </main>
      <Footer />
    </div>
  );
}

export default App;
