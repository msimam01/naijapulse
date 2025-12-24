import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { AuthModal } from "@/components/auth/AuthModal";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => setIsAuthModalOpen(true)} />
      <main className="pb-20 md:pb-0">{children}</main>
      <MobileNav onLoginClick={() => setIsAuthModalOpen(true)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
