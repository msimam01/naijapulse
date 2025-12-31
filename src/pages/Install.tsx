import { Download, Check, Smartphone, Zap, Bell, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";
import { Link } from "react-router-dom";

export default function Install() {
  const { isInstallable, isInstalled, installApp } = usePWA();

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Loads instantly, even on slow networks",
    },
    {
      icon: WifiOff,
      title: "Works Offline",
      description: "Access your polls without internet",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Get notified when polls end or trend",
    },
    {
      icon: Smartphone,
      title: "Home Screen",
      description: "Launch like a native app",
    },
  ];

  return (
    <div className="container py-10">
      <div className="max-w-xl mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary/10 mb-6">
          <Download className="h-10 w-10 text-primary" />
        </div>

        {/* Title */}
        <h1 className="font-poppins text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Install PollNaija
        </h1>

        <p className="text-muted-foreground mb-8">
          Get the full app experience with faster loading, offline access, and more.
        </p>

        {/* Install Button */}
        {isInstalled ? (
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full font-medium mb-8">
            <Check className="h-5 w-5" />
            Already Installed
          </div>
        ) : isInstallable ? (
          <Button
            onClick={installApp}
            size="lg"
            className="btn-touch text-base font-semibold mb-8"
          >
            <Download className="h-5 w-5 mr-2" />
            Install App
          </Button>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-foreground mb-3">
              How to install manually:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">iOS:</span>
                Tap the Share button → "Add to Home Screen"
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">Android:</span>
                Tap the menu (⋮) → "Install app" or "Add to Home Screen"
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">Desktop:</span>
                Click the install icon in the address bar
              </li>
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card border border-border rounded-xl p-4 text-left"
            >
              <feature.icon className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground text-sm mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Back Link */}
        <Link to="/" className="text-primary hover:underline text-sm">
          Back to PollNaija
        </Link>
      </div>
    </div>
  );
}
