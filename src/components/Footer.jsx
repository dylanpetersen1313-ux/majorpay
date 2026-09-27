import { useSalaryData } from "../lib/SalaryDataContext";

export default function Footer() {
  const { generatedAt } = useSalaryData();
  const date = new Date(generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <footer className="border-t border-line">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-8 text-xs text-ink/50 leading-relaxed">
        <p className="max-w-2xl">
          Data: U.S. Dept. of Education College Scorecard (earnings) and IPEDS (prices). Data file built {date}. Not affiliated with
          the Dept. of Education or any school listed. Informational only, not financial or career advice. Individual pay varies a lot.
        </p>
        <p className="mt-3 space-x-4">
          <a href="/methodology.html" className="underline underline-offset-2 hover:text-ink">Methodology</a>
          <a href="/terms.html" className="underline underline-offset-2 hover:text-ink">Terms &amp; data disclaimer</a>
          <a href="/privacy.html" className="underline underline-offset-2 hover:text-ink">Privacy</a>
        </p>
      </div>
    </footer>
  );
}
