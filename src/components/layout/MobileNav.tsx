import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, User, BarChart3, Compass } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface MobileNavProps {
  onLoginClick: () => void;
}

export function MobileNav({ onLoginClick }: MobileNavProps) {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { href: "/", icon: Home, label: t("nav.home") },
    { href: "/polls", icon: Compass, label: t("nav.polls") },
    { href: "/create", icon: PlusCircle, label: t("nav.create") },
    { href: "/dashboard", icon: BarChart3, label: t("nav.myPolls") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px] ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onLoginClick}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px] text-muted-foreground hover:text-foreground"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t("nav.account")}</span>
        </button>
      </div>
    </nav>
  );
}
