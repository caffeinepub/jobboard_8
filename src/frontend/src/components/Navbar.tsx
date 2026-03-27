import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Briefcase, LogOut, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Navbar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  const isLoggedIn = loginStatus === "success" && !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-4)}`
    : "";

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-border shadow-xs"
      data-ocid="navbar.panel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-xl text-foreground"
              data-ocid="navbar.link"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span>HireHub</span>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="navbar.link"
              >
                Browse Jobs
              </Link>
              {isLoggedIn && (
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="navbar.link"
                >
                  My Applications
                </Link>
              )}
              <Link
                to="/admin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="navbar.link"
              >
                Admin
              </Link>
            </nav>
          </div>

          {/* Right side CTAs */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block font-mono text-xs">
                    {shortPrincipal}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clear()}
                  data-ocid="navbar.button"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => login()}
                disabled={loginStatus === "logging-in"}
                data-ocid="navbar.button"
              >
                {loginStatus === "logging-in" ? "Signing in..." : "Login"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
