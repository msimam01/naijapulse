import { Link } from "react-router-dom";
import { Vote, Twitter, Instagram, Facebook, Mail, MapPin, Download } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  const categories = [
    { href: "/category/politics", label: t("category.politics") },
    { href: "/category/entertainment", label: t("category.entertainment") },
    { href: "/category/economy", label: t("category.economy") },
    { href: "/category/sports", label: t("category.sports") },
    { href: "/category/lifestyle", label: t("category.lifestyle") },
    { href: "/category/technology", label: t("category.technology") },
  ];

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg gradient-naija flex items-center justify-center">
                <Vote className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-poppins font-bold text-xl">
                <span className="text-primary">Naija</span>
                <span className="text-foreground">Pulse</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-foreground mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link to="/polls" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t("nav.polls")}
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t("nav.create")}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t("nav.myPolls")}
                </Link>
              </li>
              <li>
                <Link to="/install" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  {t("nav.install")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-poppins font-semibold text-foreground mb-4">{t("footer.categories")}</h4>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link to={cat.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold text-foreground mb-4">{t("footer.connect")}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4" />
                hello@naijapulse.ng
              </li>
              <li className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 mt-0.5" />
                Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} NaijaPulse. {t("footer.copyright")}</p>
            <p className="text-xs">{t("footer.madeWith")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
