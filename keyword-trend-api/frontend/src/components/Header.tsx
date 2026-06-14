import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Header() {
  const [health, setHealth] = useState<'ok' | 'error' | 'loading'>('loading');

  useEffect(() => {
    fetch('/health')
      .then((r) => (r.ok ? setHealth('ok') : setHealth('error')))
      .catch(() => setHealth('error'));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="text-cyan-400">◆</span>
            <span className="gradient-text">LeanForge</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-white/60 hover:text-white transition-colors">
              Trending
            </Link>
            <a
              href="/api/v1/keywords/trending"
              target="_blank"
              rel="noreferrer"
              className="text-white/40 hover:text-white/60 transition-colors font-mono text-xs"
            >
              API
            </a>
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  health === 'ok' ? 'bg-green-400' : health === 'error' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
                }`}
              />
              <span className="hidden sm:inline">
                {health === 'ok' ? 'Live' : health === 'error' ? 'Error' : '…'}
              </span>
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
}
