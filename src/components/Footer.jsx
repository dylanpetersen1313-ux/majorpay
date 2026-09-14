import { useSalaryData } from "../lib/SalaryDataContext";

export default function Footer() {
  const { generatedAt } = useSalaryData();
  const date = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <footer id="about" className="px-6 py-16 border-t border-line bg-paper-dim/50">
      <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-moss" />
            <span className="font-display text-lg">MajorPay</span>
          </div>
          <p className="text-sm text-ink/55 leading-relaxed max-w-sm">
            Earnings figures are median salaries reported by the US
            Department of Education's College Scorecard, based on federal tax
            records of graduates working and not enrolled in further
            schooling. Actual pay for any individual varies by role,
            location, and experience — treat this as a directional guide, not
            a guarantee.
          </p>
        </div>
        <div className="sm:text-right text-sm text-ink/45">
          <p>Data source: U.S. Dept of Education, College Scorecard</p>
          <p className="mt-1">Snapshot generated {date}</p>
          <p className="mt-1">Not affiliated with any college listed or the Dept of Education</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-10 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs text-ink/45">
        <p>© {new Date().getFullYear()} MajorPay. Informational only — not financial or career advice.</p>
        <div className="flex gap-5">
          <a href="/privacy.html" className="hover:text-ink transition-colors">
            Privacy
          </a>
          <a href="/terms.html" className="hover:text-ink transition-colors">
            Terms &amp; data disclaimer
          </a>
        </div>
      </div>
    </footer>
  );
}
