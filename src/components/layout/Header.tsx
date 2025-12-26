import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Globe, User, Plus, LayoutGrid, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onLoginClick: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, signOut, isLoading } = useAuth();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/polls", label: t("nav.polls") },
    { href: "/dashboard", label: t("nav.myPolls") },
  ];

  const categoryLinks = [
    { href: "/category/politics", label: t("category.politics") },
    { href: "/category/entertainment", label: t("category.entertainment") },
    { href: "/category/economy", label: t("category.economy") },
    { href: "/category/lifestyle", label: t("category.lifestyle") },
    { href: "/category/sports", label: t("category.sports") },
    { href: "/category/technology", label: t("category.technology") },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const getUserInitials = () => {
    if (user?.phone) {
      return user.phone.slice(-2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserDisplay = () => {
    if (user?.phone) {
      return user.phone;
    }
    if (user?.email) {
      return user.email;
    }
    return language === "pidgin" ? "User" : "User";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-poppins font-bold text-lg">
            N
          </div>
          <span className="hidden sm:block font-poppins font-bold text-xl text-foreground">
            Naija<span className="text-primary">Pulse</span>
          </span>
        </Link>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-0 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Categories Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith("/category")
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                {t("nav.categories")}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {categoryLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link to={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                <span className={language === "en" ? "font-semibold text-primary" : ""}>
                  🇬🇧 English
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("pidgin")}>
                <span className={language === "pidgin" ? "font-semibold text-primary" : ""}>
                  🇳🇬 Pidgin
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {/* Create Poll - Desktop (Only for authenticated users) */}
          {isAuthenticated && (
            <Link to="/create" className="hidden md:block">
              <Button variant="default" className="btn-touch gap-2">
                <Plus className="h-4 w-4" />
                {t("nav.create")}
              </Button>
            </Link>
          )}

          {/* Auth Section */}
          {isLoading ? (
            <div className="h-10 w-10 rounded-full bg-secondary animate-pulse" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{getUserDisplay()}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === "pidgin" ? "You don login" : "Logged in"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    {t("nav.myPolls")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/create" className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("nav.create")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  {language === "pidgin" ? "Comot" : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              onClick={onLoginClick}
              className="hidden sm:flex gap-2 btn-touch"
            >
              <User className="h-4 w-4" />
              {t("nav.login")}
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-slide-up">
          <div className="container py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("common.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-0"
              />
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    location.pathname === link.href
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Categories Header */}
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                {t("nav.categories")}
              </div>
              
              {/* Category Links */}
              <div className="grid grid-cols-2 gap-1">
                {categoryLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.href
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile Actions */}
            <div className="flex gap-2 pt-2">
              {isAuthenticated ? (
                <>
                  <Link to="/create" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full btn-touch gap-2">
                      <Plus className="h-4 w-4" />
                      {t("nav.create")}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="btn-touch"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  onClick={() => {
                    onLoginClick();
                    setIsMenuOpen(false);
                  }}
                  className="flex-1 btn-touch"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t("nav.login")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
