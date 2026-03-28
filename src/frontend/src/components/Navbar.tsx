import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsCallerAdmin } from "../hooks/useQueries";

export default function Navbar() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: profile } = useGetCallerUserProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    router.navigate({ to: "/" });
    setMobileOpen(false);
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      if (error.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const navLinks = [
    { to: "/", label: "Browse" },
    ...(isAuthenticated
      ? [
          { to: "/my-listings", label: "My Listings" },
          { to: "/my-purchases", label: "My Purchases" },
        ]
      : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const displayName =
    profile?.name || `${identity?.getPrincipal().toString().slice(0, 8)}...`;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 group"
            data-ocid="nav.link"
          >
            <img
              src="/assets/generated/pokeball-logo-transparent.png"
              alt="PokéMart"
              className="h-8 w-8 object-contain"
            />
            <span className="font-display font-bold text-xl text-foreground group-hover:text-pokemon-yellow transition-colors">
              Poké<span className="text-pokemon-red">Mart</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeProps={{ className: "text-pokemon-yellow bg-muted" }}
                data-ocid="nav.link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/create-listing" data-ocid="nav.primary_button">
                  <Button
                    size="sm"
                    className="hidden md:flex gap-1 bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
                  >
                    <Zap className="h-4 w-4" />
                    List a Card
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer border border-border hover:border-pokemon-yellow transition-colors">
                      <AvatarFallback className="bg-muted text-foreground text-xs">
                        {displayName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium truncate text-foreground">
                      {displayName}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" data-ocid="nav.link">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-listings" data-ocid="nav.link">
                        My Listings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-purchases" data-ocid="nav.link">
                        My Purchases
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" data-ocid="nav.link">
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive"
                      data-ocid="nav.button"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={loginStatus === "logging-in"}
                className="bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
                data-ocid="nav.primary_button"
              >
                {loginStatus === "logging-in" ? "Logging in..." : "Login"}
              </Button>
            )}

            <button
              type="button"
              className="md:hidden p-2 rounded-md hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.link"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/create-listing"
                className="px-3 py-2 rounded-md text-sm font-medium text-pokemon-red hover:bg-muted"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.link"
              >
                + List a Card
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
