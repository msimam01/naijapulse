import { Link } from "react-router-dom";
import { Clock, MessageCircle, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { ReportModal } from "@/components/ui/ReportModal";

export interface Poll {
  id: string;
  title: string;
  question: string;
  category: string;
  options: { text: string; votes?: number }[] | string[];
  totalVotes: number;
  commentsCount: number;
  timeRemaining: string;
  createdBy?: string;
  isTrending?: boolean;
  image_url?: string | null;
  is_sponsored?: boolean;
  voteData?: { [optionIndex: number]: number };
}

type PollOption = { text: string; votes?: number };

interface PollCardProps {
  poll: Poll;
  index?: number;
}

const categoryColors: Record<string, string> = {
  Politics: "bg-destructive/10 text-destructive border-destructive/20",
  Entertainment: "bg-accent/20 text-accent-foreground border-accent/30",
  Economy: "bg-primary/10 text-primary border-primary/20",
  Lifestyle: "bg-secondary text-secondary-foreground border-secondary",
  Sports: "bg-naija-gold/20 text-foreground border-naija-gold/30",
  Technology: "bg-primary/15 text-primary border-primary/25",
};

export function PollCard({ poll, index = 0 }: PollCardProps) {
  // For new data structure, votes are calculated separately
  // If options have votes property (old mock data), use that
  // Otherwise, show 0 votes (real data doesn't store individual option votes in poll record)
  const hasVoteData = poll.options.length > 0 && typeof poll.options[0] === 'object' && 'votes' in poll.options[0];
  const totalVotes = hasVoteData
    ? (poll.options as PollOption[]).reduce((acc, opt) => acc + (opt.votes || 0), 0)
    : poll.totalVotes; // Use totalVotes from poll record for real data
  const topOptions = poll.options.slice(0, 3);

  return (
    <Link
      to={`/poll/${poll.id}`}
      className={`block animate-fade-up`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <article className="poll-card bg-card rounded-xl border border-border p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-xs font-medium ${
                  categoryColors[poll.category] || categoryColors.Lifestyle
                }`}
              >
                {poll.category}
              </Badge>
              {poll.is_sponsored && (
                <Badge variant="secondary" className="text-xs gap-1 bg-yellow-400 text-black border-yellow-500">
                  🔥 Sponsored
                </Badge>
              )}
              {poll.isTrending && (
                <Badge variant="secondary" className="text-xs gap-1 bg-naija-gold/20 text-foreground border-naija-gold/30">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </Badge>
              )}
            </div>
            <h3 className="font-poppins font-semibold text-base sm:text-lg text-foreground line-clamp-2">
              {poll.title}
            </h3>
          </div>
        </div>

        {/* Image */}
        {poll.image_url && (
          <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
            <img
              src={poll.image_url}
              alt={poll.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Question */}
        <p className="text-sm text-muted-foreground line-clamp-2">{poll.question}</p>

        {/* Options Preview */}
        <div className="space-y-2">
          {topOptions.map((option, idx) => {
            // Use voteData if available, otherwise fallback to mock data
            const optionVotes = poll.voteData ? poll.voteData[idx] || 0 : (hasVoteData ? (option as PollOption).votes || 0 : 0);
            const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
            const showPercentage = percentage > 0;

            return (
              <div key={idx} className="relative">
                <div className="relative h-10 bg-secondary rounded-lg overflow-hidden">
                  {showPercentage && (
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-sm font-medium text-foreground truncate pr-2">
                      {typeof option === 'string' ? option : option.text}
                    </span>
                    {showPercentage && (
                      <span className="text-xs font-semibold text-primary shrink-0">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {poll.options.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{poll.options.length - 3} more options
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {poll.totalVotes.toLocaleString()} votes
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {poll.commentsCount}
              </span>
              {poll.createdBy && (
                <span className="text-xs text-muted-foreground">
                  By {poll.createdBy}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <Clock className="h-3.5 w-3.5" />
              {poll.timeRemaining}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div
              onClick={(e) => e.preventDefault()} // Prevent navigation when clicking share buttons
            >
              <ShareButtons
                title={poll.title}
                question={poll.question}
                url={`${window.location.origin}/poll/${poll.id}`}
                imageUrl={poll.image_url}
                variant="compact"
              />
            </div>

            <div
              onClick={(e) => e.preventDefault()} // Prevent navigation when clicking report button
            >
              <ReportModal
                targetType="poll"
                targetId={poll.id}
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
