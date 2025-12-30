import { Link } from "react-router-dom";
import { ArrowRight, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Poll } from "@/components/polls/PollCard";
import { useLanguage } from "@/hooks/useLanguage";

interface TrendingPollsProps {
  polls: Poll[];
}

export function TrendingPolls({ polls }: TrendingPollsProps) {
  const { t } = useLanguage();

  return (
    <section className="bg-secondary/30 py-12 sm:py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-foreground">
              {t("section.trending")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("section.trendingDesc")}
            </p>
          </div>
          <Link to="/polls" className="hidden sm:block">
            <Button variant="ghost" className="gap-2 text-primary">
              {t("section.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll, index) => {
            const topOptions = poll.options.slice(0, 3);
            const hasVoteData = poll.options.length > 0 && typeof poll.options[0] === 'object' && 'votes' in poll.options[0];
            const totalVotes = hasVoteData
              ? (poll.options as { text: string; votes?: number }[]).reduce((acc, opt) => acc + (opt.votes || 0), 0)
              : poll.totalVotes;

            return (
              <Link
                key={poll.id}
                to={`/poll/${poll.id}`}
                className="group bg-card rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-xl transition-all animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-secondary/50"
                    >
                      {poll.category}
                    </Badge>
                    {poll.isTrending && (
                      <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20 gap-1">
                        <Flame className="h-3 w-3" />
                        {t("poll.trending")}
                      </Badge>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {poll.timeRemaining}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-poppins font-semibold text-foreground line-clamp-2 mb-4 group-hover:text-primary transition-colors">
                  {poll.title}
                </h3>

                {/* Vote Count */}
                <p className="text-sm text-muted-foreground mb-4">
                  {poll.totalVotes.toLocaleString()} {t("poll.votes")}
                </p>

                {/* Options Preview */}
                <div className="space-y-3">
                  {topOptions.map((option, idx) => {
                    // Use voteData if available, otherwise fallback to mock data
                    const optionVotes = poll.voteData ? poll.voteData[idx] || 0 : (hasVoteData ? (option as { text: string; votes?: number }).votes || 0 : 0);
                    const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-foreground truncate pr-2">{typeof option === 'string' ? option : option.text}</span>
                          <span className="font-semibold text-primary shrink-0">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {optionVotes.toLocaleString()} {t("poll.votes")}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <Button
                  variant="outline"
                  className="w-full mt-4 gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                >
                  {t("poll.vote")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-6 sm:hidden">
          <Link to="/polls">
            <Button variant="outline" className="w-full gap-2">
              {t("section.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
