import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { HeroSection } from "@/components/home/HeroSection";
import { SearchSection } from "@/components/home/SearchSection";
import { FeaturedPolls } from "@/components/home/FeaturedPolls";
import { ExploreCategories } from "@/components/home/ExploreCategories";
import { TrendingPolls } from "@/components/home/TrendingPolls";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Poll } from "@/components/polls/PollCard";
import { useAuth } from "@/contexts/AuthContext";

type SupabasePoll = Tables<'polls'>;

export default function Index() {
  const { isAuthenticated } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

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
      commentsCount: 0, // TODO: implement comments
      timeRemaining,
      createdBy: poll.creator_name,
      isTrending,
    };
  };

  // Fetch polls
  useEffect(() => {
    const fetchPolls = async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching polls:', error);
        setLoading(false);
        return;
      }

      if (data) {
        const mappedPolls = data.map(mapPoll);
        setPolls(mappedPolls);
      }
      setLoading(false);
    };

    fetchPolls();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('public:polls')
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

  // Get featured polls (first 3 polls, prioritize trending)
  const featuredPolls = [...polls]
    .sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0))
    .slice(0, 3);

  // Get trending polls (different from featured, limit to 3)
  const trendingPolls = [...polls]
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

      {/* Floating Create Button - Mobile (Only for authenticated users) */}
      {isAuthenticated && (
        <Link
          to="/create"
          className="fixed bottom-20 right-4 md:hidden z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-glow flex items-center justify-center animate-bounce-subtle"
          aria-label="Create Poll"
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}
    </div>
  );
}
