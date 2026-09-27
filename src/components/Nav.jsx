export default function Nav() {
  return (
    <header className="border-b border-line">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
        <a href="/" className="font-display text-lg tracking-tight">
          Tuition Value
        </a>
        <nav className="flex items-center gap-5 text-sm text-ink/60">
          <a href="/methodology.html" className="hover:text-ink">
            Methodology
          </a>
          <a href="/terms.html" className="hover:text-ink hidden sm:inline">
            Terms
          </a>
        </nav>
      </div>
    </header>
  );
}
