import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PollCard } from "@/components/polls/PollCard";
import { PollCardSkeleton } from "@/components/polls/PollCardSkeleton";
import { CategoryFilter, CategoryFilterMobile } from "@/components/polls/CategoryFilter";
import { mockPolls } from "@/data/mockPolls";

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("trending");
  const [isLoading, setIsLoading] = useState(false);

  const filteredPolls = mockPolls.filter(
    (poll) => selectedCategory === "all" || poll.category === selectedCategory
  );

  const sortedPolls = [...filteredPolls].sort((a, b) => {
    if (selectedSort === "trending") {
      return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0) || b.totalVotes - a.totalVotes;
    }
    return 0;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero adire-pattern opacity-95" />
        <div className="relative container py-12 sm:py-16 lg:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-up">
            <h1 className="font-poppins text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-primary-foreground leading-tight">
              What's Naija
              <br />
              <span className="relative">
                Thinking Today?
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-naija-gold"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M2 10C50 2 150 2 198 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-base sm:text-lg text-primary-foreground/90 max-w-md mx-auto">
              Join thousands of Nigerians sharing their opinions on politics, entertainment, economy, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link to="/create">
                <Button
                  size="lg"
                  className="btn-touch gap-2 bg-card text-primary hover:bg-card/90 shadow-lg w-full sm:w-auto"
                >
                  <Plus className="h-5 w-5" />
                  Create a Poll
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="btn-touch gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
              >
                Explore Polls
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
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

      {/* Main Content */}
      <section className="container py-6 sm:py-8">
        {/* Mobile Category Filter */}
        <div className="lg:hidden mb-6">
          <CategoryFilterMobile
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedSort={selectedSort}
                onSortChange={setSelectedSort}
              />
            </div>
          </aside>

          {/* Poll Feed */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-poppins font-bold text-xl sm:text-2xl text-foreground">
                {selectedCategory === "all" ? "All Polls" : selectedCategory}
              </h2>
              <span className="text-sm text-muted-foreground">
                {sortedPolls.length} polls
              </span>
            </div>

            <div className="grid gap-4 sm:gap-5">
              {isLoading
                ? Array(4)
                    .fill(0)
                    .map((_, i) => <PollCardSkeleton key={i} />)
                : sortedPolls.map((poll, index) => (
                    <PollCard key={poll.id} poll={poll} index={index} />
                  ))}
            </div>

            {sortedPolls.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No polls found in this category.</p>
                <Link to="/create">
                  <Button className="btn-touch gap-2">
                    <Plus className="h-4 w-4" />
                    Create the first one!
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating Create Button - Mobile */}
      <Link
        to="/create"
        className="fixed bottom-20 right-4 md:hidden z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-glow flex items-center justify-center animate-bounce-subtle"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
