import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mockPolls, mockComments } from "@/data/mockPolls";

export default function PollView() {
  const { id } = useParams();
  const { toast } = useToast();

  const poll = mockPolls.find((p) => p.id === id) || mockPolls[0];

  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [showResults, setShowResults] = useState(false);

  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

  const handleVote = () => {
    if (selectedOption === null) {
      toast({
        title: "Please select an option",
        description: "You need to choose an option before voting.",
        variant: "destructive",
      });
      return;
    }

    setHasVoted(true);
    setShowResults(true);
    toast({
      title: "Vote submitted! 🗳️",
      description: "Thank you for sharing your opinion.",
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this poll: ${poll.title}`;

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`);
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      );
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Poll link copied to clipboard." });
    }
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    toast({ title: "Comment added!", description: "Your comment has been posted." });
    setComment("");
  };

  return (
    <div className="container py-6 sm:py-10">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to polls
        </Link>

        {/* Poll Card */}
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-8 animate-fade-up">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="space-y-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {poll.category}
              </Badge>
              <h1 className="font-poppins text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                {poll.title}
              </h1>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Flag className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Question */}
          <p className="text-base sm:text-lg text-muted-foreground mb-8">
            {poll.question}
          </p>

          {/* Voting Options */}
          <div className="space-y-3 mb-8">
            {poll.options.map((option, index) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              const isSelected = selectedOption === index;

              return (
                <button
                  key={index}
                  onClick={() => !hasVoted && setSelectedOption(index)}
                  disabled={hasVoted}
                  className={`w-full relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-primary/5"
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
                            : "border-border"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm sm:text-base font-medium text-foreground">
                        {option.text}
                      </span>
                    </div>
                    {showResults && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-primary">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground">
                          ({option.votes.toLocaleString()})
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
              size="lg"
              className="w-full btn-touch text-base font-semibold mb-6"
            >
              Submit My Vote
            </Button>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-6">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {totalVotes.toLocaleString()} votes
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              {poll.commentsCount} comments
            </span>
            <span className="flex items-center gap-1.5 text-primary font-medium">
              <Clock className="h-4 w-4" />
              {poll.timeRemaining}
            </span>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("whatsapp")}
              className="text-green-600 border-green-600/30 hover:bg-green-600/10"
            >
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("twitter")}
            >
              X/Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("copy")}
            >
              Copy Link
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 animate-fade-up delay-200">
          <h2 className="font-poppins font-bold text-xl text-foreground mb-6">
            Comments ({mockComments.length})
          </h2>

          {/* Add Comment */}
          <div className="bg-card rounded-xl border border-border p-4 mb-6">
            <Textarea
              placeholder="Share your thoughts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 focus-visible:ring-0 p-0 mb-3"
            />
            <div className="flex justify-end">
              <Button onClick={handleComment} className="gap-2">
                <Send className="h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {mockComments.map((c) => (
              <div key={c.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {c.author[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{c.author}</span>
                      <span className="text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{c.text}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Heart className="h-3.5 w-3.5" />
                        {c.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Reply className="h-3.5 w-3.5" />
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {c.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-border space-y-3">
                        {c.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-muted-foreground">
                                {reply.author[0]}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-medium text-foreground">
                                  {reply.author}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {reply.time}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
