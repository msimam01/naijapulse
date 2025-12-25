import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { HeroSection } from "@/components/home/HeroSection";
import { SearchSection } from "@/components/home/SearchSection";
import { FeaturedPolls } from "@/components/home/FeaturedPolls";
import { ExploreCategories } from "@/components/home/ExploreCategories";
import { TrendingPolls } from "@/components/home/TrendingPolls";
import { SEO } from "@/components/SEO";
import { mockPolls } from "@/data/mockPolls";

export default function Index() {
  // Get featured polls (first 3 polls, prioritize trending)
  const featuredPolls = [...mockPolls]
    .sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0))
    .slice(0, 3);

  // Get trending polls (different from featured, limit to 3)
  const trendingPolls = [...mockPolls]
    .filter((poll) => !featuredPolls.find((f) => f.id === poll.id))
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <SEO />
      
      {/* Hero Section with Image and Stats */}
      <HeroSection />

      {/* Search Section */}
      <SearchSection />

      {/* Featured Polls */}
      <FeaturedPolls polls={featuredPolls} />

      {/* Explore Categories */}
      <ExploreCategories />

      {/* Trending Polls */}
      <TrendingPolls polls={trendingPolls} />

      {/* Floating Create Button - Mobile */}
      <Link
        to="/create"
        className="fixed bottom-20 right-4 md:hidden z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-glow flex items-center justify-center animate-bounce-subtle"
        aria-label="Create Poll"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
