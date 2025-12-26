import { useState } from "react";
import { X, Phone, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = "choose" | "phone-input" | "phone-otp" | "email-input" | "email-sent";

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>("choose");
  const [phone, setPhone] = useState("+234");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signInWithPhone, signInWithEmail, verifyOtp } = useAuth();
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const resetModal = () => {
    setStep("choose");
    setPhone("+234");
    setEmail("");
    setOtp("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Nigerian phone number
    const cleanPhone = phone.replace(/\s/g, "");
    if (!cleanPhone.match(/^\+234[0-9]{10}$/)) {
      toast({
        title: language === "pidgin" ? "Wahala dey o!" : "Invalid Phone Number",
        description: language === "pidgin" 
          ? "Abeg enter correct Naija number (e.g., +2348012345678)" 
          : "Please enter a valid Nigerian number (e.g., +2348012345678)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithPhone(cleanPhone);
    setIsLoading(false);

    if (error) {
      toast({
        title: language === "pidgin" ? "E no work o!" : "Something went wrong",
        description: language === "pidgin" 
          ? "We no fit send code. Try again abeg." 
          : error.message || "Could not send verification code. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: language === "pidgin" ? "Code don send!" : "Code Sent!",
      description: language === "pidgin" 
        ? "Check your phone for the code wey we send you." 
        : "We've sent a verification code to your phone.",
    });
    setStep("phone-otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: language === "pidgin" ? "Wahala!" : "Invalid Code",
        description: language === "pidgin" 
          ? "Abeg enter the 6-digit code" 
          : "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const cleanPhone = phone.replace(/\s/g, "");
    const { error } = await verifyOtp(cleanPhone, otp);
    setIsLoading(false);

    if (error) {
      toast({
        title: language === "pidgin" ? "Wrong code o!" : "Verification Failed",
        description: language === "pidgin" 
          ? "The code no correct. Check am well or request new one." 
          : "The code is incorrect or expired. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: language === "pidgin" ? "You don enter!" : "Welcome!",
      description: language === "pidgin" 
        ? "You don login successfully. Oya make we dey go!" 
        : "You've successfully logged in.",
    });
    handleClose();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: language === "pidgin" ? "Wahala!" : "Invalid Email",
        description: language === "pidgin" 
          ? "Abeg enter correct email address" 
          : "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithEmail(email);
    setIsLoading(false);

    if (error) {
      toast({
        title: language === "pidgin" ? "E no work!" : "Something went wrong",
        description: language === "pidgin" 
          ? "We no fit send link. Try again abeg." 
          : error.message || "Could not send magic link. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setStep("email-sent");
  };

  const handleGuestContinue = () => {
    toast({
      title: language === "pidgin" ? "No wahala!" : "Continuing as Guest",
      description: language === "pidgin" 
        ? "You fit vote and comment. But you no fit create poll." 
        : "You can vote and comment, but you'll need to login to create polls.",
    });
    handleClose();
  };

  const renderStep = () => {
    switch (step) {
      case "choose":
        return (
          <div className="p-6 space-y-4">
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                {language === "pidgin" ? "How you wan enter?" : "How would you like to login?"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "pidgin" 
                  ? "No password wahala. Just pick one and we go send you code/link."
                  : "No passwords needed. We'll send you a code or link."}
              </p>
            </div>

            <Button
              onClick={() => setStep("phone-input")}
              className="w-full h-14 btn-touch gap-3 text-base justify-start px-4"
              variant="outline"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold">
                  {language === "pidgin" ? "Use Phone Number" : "Phone Number"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === "pidgin" ? "We go text you code" : "We'll text you a code"}
                </div>
              </div>
              <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {language === "pidgin" ? "Recommended" : "Recommended"}
              </span>
            </Button>

            <Button
              onClick={() => setStep("email-input")}
              className="w-full h-14 btn-touch gap-3 text-base justify-start px-4"
              variant="outline"
            >
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <div className="font-semibold">
                  {language === "pidgin" ? "Use Email" : "Email Address"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === "pidgin" ? "We go send you magic link" : "We'll send you a magic link"}
                </div>
              </div>
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {language === "pidgin" ? "or" : "or"}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full btn-touch text-muted-foreground"
              onClick={handleGuestContinue}
            >
              {language === "pidgin" ? "Continue Without Login" : "Continue as Guest"}
            </Button>
          </div>
        );

      case "phone-input":
        return (
          <form onSubmit={handlePhoneSubmit} className="p-6 space-y-4">
            <button
              type="button"
              onClick={() => setStep("choose")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === "pidgin" ? "Go back" : "Back"}
            </button>

            <div className="text-center space-y-2 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {language === "pidgin" ? "Enter your phone number" : "Enter your phone number"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "pidgin" 
                  ? "We go send OTP code to your phone"
                  : "We'll send a one-time code to your phone"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                {language === "pidgin" ? "Phone Number" : "Phone Number"}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 801 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 text-lg"
                autoFocus
                required
              />
              <p className="text-xs text-muted-foreground">
                {language === "pidgin" 
                  ? "Enter your Naija number starting with +234"
                  : "Enter your Nigerian number starting with +234"}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 btn-touch text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {language === "pidgin" ? "Dey send..." : "Sending..."}
                </div>
              ) : language === "pidgin" ? (
                "Send Code"
              ) : (
                "Send Code"
              )}
            </Button>
          </form>
        );

      case "phone-otp":
        return (
          <form onSubmit={handleOtpSubmit} className="p-6 space-y-4">
            <button
              type="button"
              onClick={() => setStep("phone-input")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === "pidgin" ? "Change number" : "Change number"}
            </button>

            <div className="text-center space-y-2 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {language === "pidgin" ? "Enter the code" : "Enter verification code"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "pidgin" 
                  ? `We don send code to ${phone}`
                  : `We sent a code to ${phone}`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">
                {language === "pidgin" ? "6-Digit Code" : "6-Digit Code"}
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="h-14 text-2xl text-center tracking-[0.5em] font-mono"
                autoFocus
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 btn-touch text-base font-semibold"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {language === "pidgin" ? "Dey verify..." : "Verifying..."}
                </div>
              ) : language === "pidgin" ? (
                "Verify & Enter"
              ) : (
                "Verify & Login"
              )}
            </Button>

            <button
              type="button"
              onClick={handlePhoneSubmit}
              className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
              disabled={isLoading}
            >
              {language === "pidgin" ? "Send new code" : "Resend code"}
            </button>
          </form>
        );

      case "email-input":
        return (
          <form onSubmit={handleEmailSubmit} className="p-6 space-y-4">
            <button
              type="button"
              onClick={() => setStep("choose")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === "pidgin" ? "Go back" : "Back"}
            </button>

            <div className="text-center space-y-2 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {language === "pidgin" ? "Enter your email" : "Enter your email"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "pidgin" 
                  ? "We go send magic link to your email"
                  : "We'll send a magic link to your email"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {language === "pidgin" ? "Email Address" : "Email Address"}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                autoFocus
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 btn-touch text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {language === "pidgin" ? "Dey send..." : "Sending..."}
                </div>
              ) : language === "pidgin" ? (
                "Send Magic Link"
              ) : (
                "Send Magic Link"
              )}
            </Button>
          </form>
        );

      case "email-sent":
        return (
          <div className="p-6 space-y-4">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {language === "pidgin" ? "Check your email!" : "Check your email!"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "pidgin" 
                  ? `We don send magic link to ${email}. Click am to enter.`
                  : `We sent a magic link to ${email}. Click the link to login.`}
              </p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                {language === "pidgin" ? "Tips:" : "Tips:"}
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>{language === "pidgin" ? "Check your spam folder" : "Check your spam folder"}</li>
                <li>{language === "pidgin" ? "Link go expire after 1 hour" : "The link expires in 1 hour"}</li>
              </ul>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full btn-touch"
              onClick={() => setStep("email-input")}
            >
              {language === "pidgin" ? "Try different email" : "Try a different email"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleClose}
            >
              {language === "pidgin" ? "Close" : "Close"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Header with Adire Pattern */}
        <div className="relative h-20 gradient-hero adire-pattern flex items-center justify-center">
          <h2 className="text-xl font-poppins font-bold text-primary-foreground">
            {language === "pidgin" ? "Enter NaijaPulse" : "Join NaijaPulse"}
          </h2>
        </div>

        {/* Content */}
        {renderStep()}
      </div>
    </div>
  );
}
