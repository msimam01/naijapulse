import { useState, useEffect } from "react";
import { Search, Filter, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PollCard } from "@/components/polls/PollCard";
import { PollCardSkeleton } from "@/components/polls/PollCardSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Poll } from "@/components/polls/PollCard";

type SupabasePoll = Tables<'polls'>;

const categories = ["All", "Politics", "Entertainment", "Economy", "Lifestyle", "Sports", "Technology"];

export default function AllPolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "ending">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Convert Supabase poll to Poll interface
  const mapPoll = (poll: SupabasePoll, voteDataMap?: { [pollId: string]: { [optionIndex: number]: number } }, commentsCount?: number): Poll => {
    // For real Supabase data, options are stored as JSON array of strings
    const options = Array.isArray(poll.options) ? poll.options as string[] : [];
    const now = new Date();
    const end = poll.duration_end ? new Date(poll.duration_end) : null;
    const timeRemaining = end ?
      (end > now ? `${Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60))}h` : "Ended") :
      "Ongoing";

    // Calculate total votes from voteDataMap if available, otherwise use stored count
    const voteData = voteDataMap?.[poll.id];
    const calculatedTotalVotes = voteData ? Object.values(voteData).reduce((sum, count) => sum + count, 0) : 0;
    const totalVotes = calculatedTotalVotes || poll.vote_count || 0;

    // Simple trending logic: high vote count or recent
    const isTrending = totalVotes > 10 ||
      (new Date(poll.created_at).getTime() > now.getTime() - 24 * 60 * 60 * 1000);

    return {
      id: poll.id,
      title: poll.title,
      question: poll.question,
      category: poll.category,
      options,
      totalVotes,
      commentsCount: commentsCount ?? poll.comment_count ?? 0,
      timeRemaining,
      createdBy: poll.creator_name,
      isTrending,
      is_sponsored: poll.is_sponsored || false,
      image_url: poll.image_url,
      voteData: voteDataMap?.[poll.id],
    };
  };

  // Fetch polls
  useEffect(() => {
    const fetchPolls = async () => {
      // Fetch polls
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('is_sponsored', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (pollsError) {
        console.error('Error fetching polls:', pollsError);
        setIsLoading(false);
        return;
      }

      // Fetch votes for all polls
      const pollIds = pollsData?.map(p => p.id) || [];
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('poll_id, option_index')
        .in('poll_id', pollIds);

      if (votesError) {
        console.error('Error fetching votes:', votesError);
      }

      // Group votes by poll_id and option_index
      const voteDataMap: { [pollId: string]: { [optionIndex: number]: number } } = {};
      votesData?.forEach(vote => {
        if (!voteDataMap[vote.poll_id]) {
          voteDataMap[vote.poll_id] = {};
        }
        voteDataMap[vote.poll_id][vote.option_index] = (voteDataMap[vote.poll_id][vote.option_index] || 0) + 1;
      });

      // Fetch comment counts for all polls
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('poll_id')
        .in('poll_id', pollIds);

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      }

      // Count comments per poll
      const commentCountMap: { [pollId: string]: number } = {};
      commentsData?.forEach(comment => {
        commentCountMap[comment.poll_id] = (commentCountMap[comment.poll_id] || 0) + 1;
      });

      if (pollsData) {
        const mappedPolls = pollsData.map(poll => {
          const commentsCount = commentCountMap[poll.id] || poll.comment_count || 0;
          return mapPoll(poll, voteDataMap, commentsCount);
        });
        setPolls(mappedPolls);
      }
      setIsLoading(false);
    };

    fetchPolls();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('all-polls')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'polls',
      }, (payload) => {
        const newPoll = mapPoll(payload.new as SupabasePoll);
        setPolls(prev => [newPoll, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'polls',
      }, (payload) => {
        const updatedPoll = mapPoll(payload.new as SupabasePoll);
        setPolls(prev => prev.map(p => p.id === updatedPoll.id ? updatedPoll : p));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredPolls = polls.filter((poll) => {
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
          Browse and participate in {polls.length}+ active polls
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
        Showing {sortedPolls.length} of {polls.length} polls
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
