import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Filter } from "lucide-react";
import { PollCard } from "@/components/polls/PollCard";
import { PollCardSkeleton } from "@/components/polls/PollCardSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Poll } from "@/components/polls/PollCard";
import { useState, useEffect } from "react";

const categoryInfo: Record<string, { title: string; description: string; icon: string }> = {
  politics: {
    title: "Politics",
    description: "Elections, governance, and political debates",
    icon: "🏛️",
  },
  entertainment: {
    title: "Entertainment",
    description: "Music, movies, celebrities, and pop culture",
    icon: "🎬",
  },
  economy: {
    title: "Economy",
    description: "Business, finance, and economic policies",
    icon: "💰",
  },
  lifestyle: {
    title: "Lifestyle",
    description: "Food, fashion, relationships, and daily life",
    icon: "✨",
  },
  sports: {
    title: "Sports",
    description: "Football, athletics, and sports news",
    icon: "⚽",
  },
  technology: {
    title: "Technology",
    description: "Tech trends, startups, and innovation",
    icon: "📱",
  },
};

type SupabasePoll = Tables<'polls'>;

export default function CategoryPage() {
  const { category } = useParams();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  const normalizedCategory = category?.toLowerCase() || "";
  const info = categoryInfo[normalizedCategory];

  // Convert Supabase poll to Poll interface
  const mapPoll = (poll: SupabasePoll): Poll => {
    // For real Supabase data, options are stored as JSON array of strings
    const options = Array.isArray(poll.options) ? poll.options as string[] : [];
    const now = new Date();
    const end = poll.duration_end ? new Date(poll.duration_end) : null;
    const timeRemaining = end ?
      (end > now ? `${Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60))}h` : "Ended") :
      "Ongoing";

    // Simple trending logic: high vote count or recent
    const isTrending = poll.vote_count > 10 ||
      (new Date(poll.created_at).getTime() > now.getTime() - 24 * 60 * 60 * 1000);

    return {
      id: poll.id,
      title: poll.title,
      question: poll.question,
      category: poll.category,
      options,
      totalVotes: poll.vote_count || 0,
      commentsCount: 0,
      timeRemaining,
      createdBy: poll.creator_name,
      isTrending,
    };
  };

  // Fetch polls for this category
  useEffect(() => {
    if (!normalizedCategory || !info) return;

    const fetchPolls = async () => {
      console.log('Fetching polls for category:', normalizedCategory);

      // First, let's see what categories exist in the database
      const { data: allPolls, error: allError } = await supabase
        .from('polls')
        .select('category')
        .limit(100);

      if (allError) {
        console.error('Error fetching all polls:', allError);
      } else {
        const categories = [...new Set(allPolls?.map(p => p.category) || [])];
        console.log('Available categories in DB:', categories);
      }

      // Use ilike for case-insensitive matching
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .ilike('category', normalizedCategory)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching polls:', error);
        setIsLoading(false);
        return;
      }

      console.log('Raw polls data for category:', data);

      if (data) {
        // Double-check category match in case ilike is too broad
        const filteredData = data.filter(poll =>
          poll.category.toLowerCase() === normalizedCategory
        );
        console.log('Filtered polls for category:', filteredData.length);
        const mappedPolls = filteredData.map(mapPoll);
        setPolls(mappedPolls);
      }
      setIsLoading(false);
    };

    fetchPolls();
  }, [normalizedCategory, info]);

  const sortedPolls = [...polls].sort((a, b) => {
    if (sortBy === "popular") {
      return b.totalVotes - a.totalVotes;
    }
    return 0;
  });

  if (!info) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="font-poppins text-2xl font-bold text-foreground mb-4">
            Category Not Found
          </h1>
          <Link to="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 sm:py-10">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      {/* Category Header */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{info.icon}</span>
          <div>
            <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-foreground">
              {info.title}
            </h1>
            <p className="text-muted-foreground">{info.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {polls.length} polls in this category
          </p>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "popular")}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Polls Grid */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <PollCardSkeleton key={i} />)
          : sortedPolls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
      </div>

      {!isLoading && sortedPolls.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No polls in this category yet.</p>
          <Link to="/create" className="text-primary hover:underline mt-2 inline-block">
            Create the first poll
          </Link>
        </div>
      )}
    </div>
  );
}
