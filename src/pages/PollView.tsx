import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock,
  Users,
  MessageCircle,
  Share2,
  Flag,
  ArrowLeft,
  Send,
  Heart,
  Reply,
  BarChart3,
  PieChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ResultChart } from "@/components/polls/ResultChart";
import { SEO } from "@/components/SEO";
import CommentSection from "@/components/comments/CommentSection";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { useRealtimeVotes } from "@/hooks/useRealtimeVotes";

type Poll = Tables<'polls'>;
type Vote = Tables<'votes'>;

interface PollOption {
  text: string;
}

interface ChartOption extends PollOption {
  votes: number;
}

export default function PollView() {
  const { id } = useParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  // Hardcoded admin UID - replace with your actual user ID
  const ADMIN_UID = 'b431bbce-f096-4edd-9d3d-d3a06253f514';
  const isAdmin = user?.id === ADMIN_UID;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Guest ID for unauthenticated users
  const getGuestId = () => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  };

  // Check if user/guest has already voted
  const checkIfVoted = useCallback(async (pollId: string) => {
    if (user) {
      const { data } = await supabase
        .from('votes')
        .select()
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .single();
      if (data) {
        setHasVoted(true);
        setUserVote(data);
        setShowResults(true);
        return true;
      }
    } else {
      const guestId = getGuestId();
      const { data } = await supabase
        .from('votes')
        .select()
        .eq('poll_id', pollId)
        .eq('guest_id', guestId)
        .single();
      if (data) {
        setHasVoted(true);
        setUserVote(data);
        setShowResults(true);
        return true;
      }
    }
    return false;
  }, [user]);

  // Get poll options as array
  const getPollOptions = (): PollOption[] => {
    if (!poll?.options) return [];



    // Handle different possible data structures from Supabase
    const options = poll.options;
    if (Array.isArray(options)) {
      return options.map(option => {
        if (typeof option === 'string') {
          return { text: option };
        } else if (typeof option === 'object' && option && 'text' in option) {
          return { text: String(option.text) };
        }
        return { text: String(option) };
      });
    }

    return [];
  };

  // Aggregate votes by option
  const getVoteCounts = () => {
    const options = getPollOptions();
    const counts = options.map(() => 0);
    votes.forEach(vote => {
      if (vote.option_index >= 0 && vote.option_index < counts.length) {
        counts[vote.option_index]++;
      }
    });
    return counts;
  };

  // Get options with vote counts for chart
  const getChartOptions = (): ChartOption[] => {
    const options = getPollOptions();
    const counts = getVoteCounts();
    return options.map((opt, index) => ({
      ...opt,
      votes: counts[index],
    }));
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!poll?.duration_end) return "Ongoing";
    const end = new Date(poll.duration_end);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const totalVotes = votes.length;

  // Fetch poll and votes
  useEffect(() => {
    if (!id) return;

    const fetchPoll = async () => {
      const { data: pollData, error } = await supabase
        .from('polls')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !pollData) {
        toast({
          title: "Poll not found",
          description: "The poll you're looking for doesn't exist.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setPoll(pollData);
      await checkIfVoted(id);
      setLoading(false);
    };

    fetchPoll();
  }, [id, checkIfVoted, toast]);

  // Use realtime votes hook for this poll
  const { votes: realtimeVotes } = useRealtimeVotes({
    pollId: id || undefined,
  });

  // Update local votes state when realtime votes change
  useEffect(() => {
    setVotes(realtimeVotes);
  }, [realtimeVotes]);

  const handleVote = async () => {
    if (selectedOption === null || !poll) {
      toast({
        title: "Please select an option",
        description: "You need to choose an option before voting.",
        variant: "destructive",
      });
      return;
    }

    setVoting(true);
    try {
      const voteData = {
        poll_id: poll.id,
        option_index: selectedOption,
        user_id: user?.id || null,
        guest_id: user ? null : getGuestId(),
      };

      const { error } = await supabase
        .from('votes')
        .insert(voteData);

      if (error) {
        toast({
          title: "Voting failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Update poll vote_count
      await supabase
        .from('polls')
        .update({ vote_count: (poll.vote_count || 0) + 1 })
        .eq('id', poll.id);

      setHasVoted(true);
      setUserVote(voteData as Vote);
      setShowResults(true);
      toast({
        title: "Vote submitted! 🗳️",
        description: "Thank you for sharing your opinion.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  const handleToggleSponsored = async () => {
    if (!poll || !isAdmin) return;

    try {
      const newSponsoredStatus = !poll.is_sponsored;
      const { error } = await supabase
        .from('polls')
        .update({ is_sponsored: newSponsoredStatus })
        .eq('id', poll.id);

      if (error) {
        toast({
          title: "Failed to update sponsored status",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setPoll(prev => prev ? { ...prev, is_sponsored: newSponsoredStatus } : null);
      toast({
        title: newSponsoredStatus ? "Poll marked as sponsored" : "Poll unmarked as sponsored",
        description: "Changes will be reflected in the feed.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };





  if (loading) {
    return (
      <div className="container py-6 sm:py-10">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="container py-6 sm:py-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Poll not found</h1>
          <Link to="/" className="text-primary hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const pollOptions = getPollOptions();
  const voteCounts = getVoteCounts();

  return (
    <div className="container py-6 sm:py-10">
      <SEO
        title={`${poll.title} | NaijaPulse`}
        description={poll.question}
        image={poll.image_url || "/pwa-512x512.png"}
        url={`/poll/${poll.id}`}
        type="article"
        keywords={`${poll.category}, Nigeria poll, ${poll.title}, vote`}
      />
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("poll.back")}
        </Link>

        {/* Poll Card */}
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-8 animate-fade-up">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {poll.category}
                </Badge>
                {poll.is_sponsored && (
                  <Badge variant="secondary" className="bg-yellow-400 text-black border-yellow-500">
                    🔥 Sponsored
                  </Badge>
                )}
              </div>
              <h1 className="font-poppins text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                {poll.title}
              </h1>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Flag className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Image */}
          {poll.image_url && (
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary mb-6">
              <img
                src={poll.image_url}
                alt={poll.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Question */}
          <p className="text-base sm:text-lg text-muted-foreground mb-8">
            {poll.question}
          </p>

          {/* Admin Toggle */}
          {isAdmin && (
            <div className="mb-6 p-4 bg-secondary/30 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Admin Controls</h3>
                  <p className="text-sm text-muted-foreground">
                    Toggle sponsored status for this poll
                  </p>
                </div>
                <Button
                  onClick={handleToggleSponsored}
                  variant={poll.is_sponsored ? "destructive" : "default"}
                  size="sm"
                  className="gap-2"
                >
                  {poll.is_sponsored ? "Unmark as Sponsored" : "Mark as Sponsored"}
                </Button>
              </div>
            </div>
          )}

          {/* Voting Options */}
          <div className="space-y-3 mb-8">
            {pollOptions.map((option, index) => {
              const votes = voteCounts[index];
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              const isSelected = selectedOption === index;
              const isUserChoice = userVote?.option_index === index;

              return (
                <button
                  key={index}
                  onClick={() => !hasVoted && setSelectedOption(index)}
                  disabled={hasVoted || voting}
                  className={`w-full relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : isUserChoice
                      ? "border-green-500 bg-green-500/5"
                      : "border-border hover:border-primary/50"
                  } ${hasVoted ? "cursor-default" : "cursor-pointer"}`}
                >
                  {showResults && (
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/15 transition-all duration-700 progress-animate"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-primary bg-primary"
                            : isUserChoice
                            ? "border-green-500 bg-green-500"
                            : "border-border"
                        }`}
                      >
                        {(isSelected || isUserChoice) && (
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm sm:text-base font-medium text-foreground">
                        {option.text}
                      </span>
                      {isUserChoice && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Your choice
                        </Badge>
                      )}
                    </div>
                    {showResults && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-primary">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground">
                          ({votes.toLocaleString()})
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Vote Button */}
          {!hasVoted && (
            <Button
              onClick={handleVote}
              disabled={voting}
              size="lg"
              className="w-full btn-touch text-base font-semibold mb-6"
            >
              {voting ? "Submitting..." : "Submit My Vote"}
            </Button>
          )}

          {/* Result Chart */}
          {showResults && (
            <div className="mb-6 p-4 bg-secondary/30 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Results</h3>
                <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                  <button
                    onClick={() => setChartType("pie")}
                    className={`p-2 rounded-md transition-colors ${
                      chartType === "pie"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <PieChartIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setChartType("bar")}
                    className={`p-2 rounded-md transition-colors ${
                      chartType === "bar"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <ResultChart options={getChartOptions()} type={chartType} />
            </div>
          )}

          {/* Comments Section */}
          {poll && (
            <div className="mb-6">
              <CommentSection
                pollId={poll.id}
                onCommentCountChange={setCommentCount}
              />
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-6">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {totalVotes.toLocaleString()} votes
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              {commentCount.toLocaleString()} comments
            </span>
            <span className="flex items-center gap-1.5 text-primary font-medium">
              <Clock className="h-4 w-4" />
              {getTimeRemaining()}
            </span>
          </div>

          {/* Share Buttons */}
          {poll && (
            <div className="mt-6 pt-6 border-t border-border">
              <ShareButtons
                title={poll.title}
                question={poll.question}
                url={`${window.location.origin}/poll/${poll.id}`}
                imageUrl={poll.image_url}
                variant="default"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
