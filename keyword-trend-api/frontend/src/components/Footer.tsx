export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <span>© {new Date().getFullYear()} LeanForge. Keyword trend intelligence.</span>
          <div className="flex items-center gap-4">
            <span>Powered by Regent API</span>
            <a href="/api/v1/keywords/trending" target="_blank" rel="noreferrer" className="hover:text-white/50 transition-colors">
              API Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
