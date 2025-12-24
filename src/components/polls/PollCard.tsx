import { Link } from "react-router-dom";
import { Clock, MessageCircle, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Poll {
  id: string;
  title: string;
  question: string;
  category: string;
  options: { text: string; votes: number }[];
  totalVotes: number;
  commentsCount: number;
  timeRemaining: string;
  createdBy?: string;
  isTrending?: boolean;
}

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
  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
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

        {/* Question */}
        <p className="text-sm text-muted-foreground line-clamp-2">{poll.question}</p>

        {/* Options Preview */}
        <div className="space-y-2">
          {topOptions.map((option, idx) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            return (
              <div key={idx} className="relative">
                <div className="relative h-10 bg-secondary rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-sm font-medium text-foreground truncate pr-2">
                      {option.text}
                    </span>
                    <span className="text-xs font-semibold text-primary shrink-0">
                      {percentage.toFixed(0)}%
                    </span>
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
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {poll.totalVotes.toLocaleString()} votes
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {poll.commentsCount}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-primary">
            <Clock className="h-3.5 w-3.5" />
            {poll.timeRemaining}
          </span>
        </div>
      </article>
    </Link>
  );
}
