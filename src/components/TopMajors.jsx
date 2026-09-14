import { motion } from "framer-motion";
import { useSalaryData } from "../lib/SalaryDataContext";
import { formatMoney } from "../lib/format";

export default function TopMajors() {
  const { topMajors } = useSalaryData();
  const top = topMajors.slice(0, 8);

  return (
    <section id="leaderboard" className="px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-ink">
            Highest paying majors
          </h2>
          <p className="mt-3 text-ink/60 max-w-lg">
            Median earnings across every college we track, four years after
            graduation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {top.map((m, i) => (
            <motion.div
              key={m.major}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="flex items-center gap-5 rounded-2xl border border-line bg-paper p-5 hover:border-moss/50 hover:shadow-sm transition-all"
            >
              <span className="font-display text-3xl text-line tabular w-10 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-ink truncate">{m.major}</div>
                <div className="text-xs text-ink/45">
                  {m.schoolCount} colleges reporting
                </div>
              </div>
              <div className="font-display text-2xl text-moss tabular shrink-0">
                {formatMoney(m.medianEarnings)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
