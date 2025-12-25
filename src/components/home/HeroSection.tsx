import { Link } from "react-router-dom";
import { ArrowRight, Vote, Users, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import heroImage from "@/assets/hero-nigerians.jpg";

export function HeroSection() {
  const { t } = useLanguage();
  
  const stats = [
    { icon: Vote, value: "2.5K+", label: t("hero.stats.polls") },
    { icon: Users, value: "1.2M+", label: t("hero.stats.users") },
    { icon: TrendingUp, value: "89K", label: t("hero.stats.votes") },
    { icon: MapPin, value: "36 + FCT", label: "States" },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      
      <div className="relative container py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-up text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-naija-gold animate-pulse" />
              <span className="text-sm font-medium text-primary-foreground">
                Over 1M+ Nigerians polling daily
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-poppins text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-primary-foreground leading-tight">
              {t("hero.title")}
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-primary-foreground/90 max-w-md mx-auto lg:mx-0">
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Link to="/create">
                <Button
                  size="lg"
                  className="btn-touch gap-2 bg-card text-primary hover:bg-card/90 shadow-lg w-full sm:w-auto font-semibold"
                >
                  {t("hero.cta")}
                </Button>
              </Link>
              <Link to="/polls">
                <Button
                  variant="outline"
                  size="lg"
                  className="btn-touch gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto font-semibold"
                >
                  {t("hero.exploreCta")}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="relative animate-fade-up delay-200">
            <div className="relative">
              {/* Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroImage}
                  alt="Nigerians engaging with polls"
                  className="w-full h-auto object-cover aspect-square lg:aspect-[4/3]"
                  loading="eager"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>

              {/* Floating Badge - Top Right */}
              <div className="absolute -top-3 -right-3 sm:top-2 sm:right-2 h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-primary shadow-lg flex items-center justify-center animate-bounce-subtle">
                <Vote className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" />
              </div>

              {/* Floating Badge - Bottom Left */}
              <div className="absolute -bottom-3 -left-3 sm:bottom-4 sm:left-0 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-naija-gold shadow-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 lg:mt-16">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-xl p-4 sm:p-6 text-center animate-fade-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary-foreground/10 mb-3">
                <stat.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="font-poppins font-bold text-2xl sm:text-3xl text-primary-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-primary-foreground/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          className="w-full h-12 sm:h-16 lg:h-20"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80V40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
