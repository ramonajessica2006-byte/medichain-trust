import { Link } from "@tanstack/react-router";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const links = [
    { to: "/", label: "Home" },
    { to: "/verify", label: "Verify Medicine" },
    { to: "/report", label: "Report Fake" },
    { to: "/how-it-works", label: "How It Works" },
    { to: "/dashboard", label: "Dashboard" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-hero text-white shadow-md transition-transform group-hover:scale-105">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Medi<span className="text-gradient">Chain</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-medium text-foreground bg-secondary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button variant="ghost" size="sm" onClick={() => logout()}>Sign out</Button>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm">Admin Login</Button>
            </Link>
          )}
          <Link to="/verify">
            <Button size="sm" className="gradient-hero text-white hover:opacity-90 shadow-md">
              Verify Now
            </Button>
          </Link>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden mx-3 mt-2 glass rounded-2xl p-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t pt-2 flex gap-2">
            {user ? (
              <Button variant="outline" size="sm" className="flex-1" onClick={() => logout()}>Sign out</Button>
            ) : (
              <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Admin Login</Button>
              </Link>
            )}
            <Link to="/verify" className="flex-1" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full gradient-hero text-white">Verify Now</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
