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
import { useRealtimeVotes } from "@/hooks/useRealtimeVotes";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

type SupabasePoll = Tables<'polls'>;

export default function Index() {
  const { isAuthenticated } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert Supabase poll to Poll interface
  const mapPoll = (poll: SupabasePoll, voteDataMap?: { [pollId: string]: { [optionIndex: number]: number } }): Poll => {
    // For real Supabase data, options are stored as JSON array of strings
    const options = Array.isArray(poll.options) ? poll.options as string[] : [];
    const now = new Date();
    const end = poll.duration_end ? new Date(poll.duration_end) : null;
    const timeRemaining = end ?
      (end > now ? `${Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60))}h` : "Ended") :
      "Ongoing";

    // Trending logic: recent polls with votes
    const isTrending = poll.vote_count > 0 &&
      (new Date(poll.created_at).getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      id: poll.id,
      title: poll.title,
      question: poll.question,
      category: poll.category,
      options,
      totalVotes: poll.vote_count || 0,
      commentsCount: poll.comment_count || 0,
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
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // First try to get recent trending polls (last 7 days with votes)
      let { data: recentPolls, error: recentError } = await supabase
        .from('polls')
        .select('*')
        .gte('created_at', sevenDaysAgo)
        .gt('vote_count', 0)
        .order('vote_count', { ascending: false })
        .order('is_sponsored', { ascending: false })
        .limit(20);

      if (recentError) {
        console.error('Error fetching recent polls:', recentError);
        setLoading(false);
        return;
      }

      // If we have fewer than 6 recent polls, supplement with all-time top polls
      if (!recentPolls || recentPolls.length < 6) {
        const existingIds = recentPolls?.map(p => p.id) || [];
        const { data: allTimePolls, error: allTimeError } = await supabase
          .from('polls')
          .select('*')
          .not('id', 'in', `(${existingIds.join(',')})`)
          .order('vote_count', { ascending: false })
          .order('is_sponsored', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(20 - (recentPolls?.length || 0));

        if (!allTimeError && allTimePolls) {
          recentPolls = [...(recentPolls || []), ...allTimePolls];
        }
      }

      // Fetch votes for all polls to calculate percentages
      const pollIds = recentPolls?.map(p => p.id) || [];
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

      if (recentPolls) {
        const mappedPolls = recentPolls.map(poll => mapPoll(poll, voteDataMap));
        setPolls(mappedPolls);
      }
      setLoading(false);
    };

    fetchPolls();
  }, []);

  // Handle global vote updates for realtime percentage changes
  const handleVoteUpdate = (pollId: string, updatedVotes: any[]) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        // Recalculate voteData for this poll
        const voteDataMap: { [optionIndex: number]: number } = {};
        updatedVotes.forEach(vote => {
          voteDataMap[vote.option_index] = (voteDataMap[vote.option_index] || 0) + 1;
        });

        // Update total votes count
        const totalVotes = updatedVotes.length;

        return {
          ...poll,
          voteData: voteDataMap,
          totalVotes,
        };
      }
      return poll;
    }));
  };

  // Use global realtime votes hook
  const { votes: globalVotes } = useRealtimeVotes({
    onVoteUpdate: handleVoteUpdate,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('public:polls')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'polls',
      }, (payload) => {
        // For new polls, we don't have voteData yet, but that's okay
        const newPoll = mapPoll(payload.new as SupabasePoll);
        setPolls(prev => [newPoll, ...prev].sort((a, b) => {
          // Re-sort after adding new poll
          if (a.is_sponsored && !b.is_sponsored) return -1;
          if (!a.is_sponsored && b.is_sponsored) return 1;
          return b.totalVotes - a.totalVotes;
        }));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'polls',
      }, (payload) => {
        // Preserve existing voteData when updating poll
        setPolls(prev => prev.map(p => {
          if (p.id === payload.new.id) {
            const updatedPoll = mapPoll(payload.new as SupabasePoll);
            return { ...updatedPoll, voteData: p.voteData }; // Preserve voteData
          }
          return p;
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get featured polls (prioritize sponsored, then high-engagement)
  const featuredPolls = [...polls]
    .sort((a, b) => {
      if (a.is_sponsored && !b.is_sponsored) return -1;
      if (!a.is_sponsored && b.is_sponsored) return 1;
      return b.totalVotes - a.totalVotes;
    })
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
