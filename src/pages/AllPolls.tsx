import { useState, useEffect } from "react";
import { Search, Filter, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PollCard } from "@/components/polls/PollCard";
import { PollCardSkeleton } from "@/components/polls/PollCardSkeleton";
import { mockPolls } from "@/data/mockPolls";

const categories = ["All", "Politics", "Entertainment", "Economy", "Lifestyle", "Sports", "Technology"];

export default function AllPolls() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "ending">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredPolls = mockPolls.filter((poll) => {
    const matchesSearch = poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || poll.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPolls = [...filteredPolls].sort((a, b) => {
    if (sortBy === "popular") {
      return b.totalVotes - a.totalVotes;
    }
    if (sortBy === "ending") {
      return a.timeRemaining.localeCompare(b.timeRemaining);
    }
    return 0;
  });

  return (
    <div className="container py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-foreground mb-2">
          All Polls
        </h1>
        <p className="text-muted-foreground">
          Browse and participate in {mockPolls.length}+ active polls
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 mb-8">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort & View */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "popular" | "ending")}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="ending">Ending Soon</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-9 w-9"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-9 w-9"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {sortedPolls.length} of {mockPolls.length} polls
      </p>

      {/* Polls Grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }
      >
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <PollCardSkeleton key={i} />)
          : sortedPolls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
      </div>

      {!isLoading && sortedPolls.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">No polls found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
