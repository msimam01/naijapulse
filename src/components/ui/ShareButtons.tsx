import { Share2, MessageCircle, Twitter, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface ShareButtonsProps {
  title: string;
  question: string;
  url: string;
  imageUrl?: string | null;
  className?: string;
  variant?: "default" | "compact";
}

export function ShareButtons({
  title,
  question,
  url,
  imageUrl,
  className = "",
  variant = "default"
}: ShareButtonsProps) {
  const { toast } = useToast();
  const { language } = useLanguage();

  // Generate engaging share text
  const getShareText = () => {
    const baseText = language === "pidgin"
      ? `See wetin Nigerians dey talk about! 🤔 "${title}"`
      : `What's Naija thinking? 🤔 "${title}"`;

    return baseText;
  };

  // Use Web Share API if available (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: getShareText(),
          url: url,
        });
      } catch (error) {
        // Fallback to individual buttons if user cancels
        console.log('Web Share cancelled or failed');
      }
    }
  };

  const handleWhatsAppShare = () => {
    const text = `${getShareText()}\n\n${question}\n\n${url}`;

    // Try native WhatsApp app first, fallback to web
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
    const webWhatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    // Try to open native app, fallback to web after a delay
    window.open(whatsappUrl, '_blank');

    // Fallback to web WhatsApp after 2 seconds (if native app didn't open)
    setTimeout(() => {
      window.open(webWhatsappUrl, '_blank');
    }, 2000);
  };

  const handleTwitterShare = () => {
    const text = `${getShareText()}\n\n${question}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: language === "pidgin" ? "Link copied!" : "Link copied!",
        description: language === "pidgin"
          ? "Poll link don dey for your clipboard"
          : "Poll link copied to clipboard",
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      toast({
        title: language === "pidgin" ? "Link copied!" : "Link copied!",
        description: language === "pidgin"
          ? "Poll link don dey for your clipboard"
          : "Poll link copied to clipboard",
      });
    }
  };

  const shareText = getShareText();

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Share2 className="h-4 w-4" />
          {language === "pidgin" ? "Share:" : "Share:"}
        </span>

        {navigator.share && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="gap-1"
          >
            <Share2 className="h-4 w-4" />
            {language === "pidgin" ? "Share" : "Share"}
          </Button>
        )}

        {!navigator.share && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppShare}
              className="text-green-600 border-green-600/30 hover:bg-green-600/10 gap-1"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTwitterShare}
              className="gap-1"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  }

  // Default variant - full buttons with labels
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Share2 className="h-5 w-5" />
        <span className="font-medium">
          {language === "pidgin" ? "Share this poll!" : "Share this poll!"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {navigator.share ? (
          <Button
            onClick={handleNativeShare}
            className="btn-touch gap-3 h-12 text-base font-semibold"
            size="lg"
          >
            <Share2 className="h-5 w-5" />
            {language === "pidgin" ? "Share Poll" : "Share Poll"}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleWhatsAppShare}
              className="btn-touch gap-3 h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </Button>

            <Button
              onClick={handleTwitterShare}
              variant="outline"
              className="btn-touch gap-3 h-12 text-base font-semibold border-gray-800 text-gray-900 hover:bg-gray-50"
              size="lg"
            >
              <Twitter className="h-5 w-5" />
              X/Twitter
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="btn-touch gap-3 h-12 text-base font-semibold"
              size="lg"
            >
              <Copy className="h-5 w-5" />
              {language === "pidgin" ? "Copy Link" : "Copy Link"}
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {language === "pidgin"
          ? "Help spread the word! Make Naija talk about this poll. 🇳🇬"
          : "Help spread the word! Get your friends talking about this poll. 🇳🇬"}
      </p>
    </div>
  );
}
