import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border pt-8 pb-6">
      <div className="flex flex-col items-center gap-4 text-xs font-mono text-muted-foreground sm:flex-row sm:justify-between">
        <p>Zapr · runs entirely on your device</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <Link to="/contact" className="hover:text-primary transition-colors">
            Contact · Report a bug
          </Link>
          <Link to="/how-to-use" className="hover:text-primary transition-colors">
            How to use
          </Link>
        </nav>
      </div>
    </footer>
  );
}
