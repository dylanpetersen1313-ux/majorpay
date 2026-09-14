import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSalaryData } from "../lib/useSalaryData";
import { useCountUp } from "../lib/useCountUp";
import { formatMoney } from "../lib/format";

const CYCLE = ["Computer Science", "Economics", "Nursing", "Mechanical Engineering", "History"];

function BackgroundBars() {
  const heights = [30, 55, 40, 70, 48, 85, 60, 95, 72, 110];
  return (
    <div className="absolute right-[-4%] top-1/2 -translate-y-1/2 flex items-end gap-2.5 opacity-[0.14] pointer-events-none select-none">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: h * 2.6 }}
          transition={{ duration: 1.1, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="w-6 sm:w-8 rounded-t-sm bg-moss"
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const { schoolCount, majorCount, topMajors } = useSalaryData();
  const [idx, setIdx] = useState(0);
  const highest = topMajors[0];

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % CYCLE.length), 2200);
    return () => clearInterval(t);
  }, []);

  const [schoolRef, schoolDisplay] = useCountUp(schoolCount);
  const [majorRef, majorDisplay] = useCountUp(majorCount);
  const [highRef, highDisplay] = useCountUp(highest?.medianEarnings);

  return (
    <section id="top" className="relative overflow-hidden pt-40 pb-28 px-6">
      <BackgroundBars />
      <div className="max-w-4xl mx-auto relative">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="uppercase tracking-[0.18em] text-xs font-semibold text-moss mb-5"
        >
          Real graduate outcomes, straight from the US Dept of Education
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-[2.6rem] leading-[1.08] sm:text-6xl sm:leading-[1.05] tracking-tight text-ink"
        >
          What does a{" "}
          <span className="relative inline-block text-moss">
            <AnimatePresence mode="wait">
              <motion.span
                key={CYCLE[idx]}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="inline-block"
              >
                {CYCLE[idx]}
              </motion.span>
            </AnimatePresence>
          </span>{" "}
          degree actually pay?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-ink/65 max-w-xl leading-relaxed"
        >
          Median salaries by college and major, pulled directly from federal
          earnings data — not surveys, not self-reported guesses.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <a
            href="#explore"
            className="inline-flex items-center gap-2 rounded-full bg-ink text-paper px-6 py-3.5 text-sm font-semibold hover:bg-moss transition-colors"
          >
            Explore the data
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-ink/60 hover:text-ink transition-colors"
          >
            Where's this from?
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-16 grid grid-cols-3 gap-6 max-w-xl border-t border-line pt-8"
        >
          <div ref={schoolRef}>
            <div className="font-display text-3xl sm:text-4xl tabular text-ink">
              {schoolDisplay}
            </div>
            <div className="text-xs uppercase tracking-wide text-ink/50 mt-1">
              Colleges tracked
            </div>
          </div>
          <div ref={majorRef}>
            <div className="font-display text-3xl sm:text-4xl tabular text-ink">
              {majorDisplay}
            </div>
            <div className="text-xs uppercase tracking-wide text-ink/50 mt-1">
              Majors covered
            </div>
          </div>
          <div ref={highRef}>
            <div className="font-display text-3xl sm:text-4xl tabular text-moss">
              {formatMoney(highDisplay)}
            </div>
            <div className="text-xs uppercase tracking-wide text-ink/50 mt-1">
              Top median, {highest?.major}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
