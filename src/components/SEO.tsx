import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  keywords?: string;
}

export function SEO({
  title = "NaijaPulse - Nigeria's #1 Public Opinion & Polling Platform",
  description = "Join thousands of Nigerians sharing opinions on politics, entertainment, economy & more. Create polls, vote, and see what Naija is thinking today!",
  image = "/pwa-512x512.png",
  url = typeof window !== "undefined" ? window.location.href : "",
  type = "website",
  keywords = "Nigeria polls, Nigerian opinions, Naija pulse, voting platform, public opinion Nigeria, Nigerian survey",
}: SEOProps) {
  const siteUrl = "https://naijapulse.lovable.app";
  const fullImageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;
  const fullUrl = url.startsWith("http") ? url : `${siteUrl}${url}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="NaijaPulse" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* WhatsApp */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}
