import { motion } from "framer-motion";

export default function Nav() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-paper/80 border-b border-line"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-moss" />
          <span className="font-display text-xl tracking-tight">MajorPay</span>
        </a>
        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-ink/70">
          <a href="#about" className="hover:text-ink transition-colors">
            About the data
          </a>
        </nav>
      </div>
    </motion.header>
  );
}
