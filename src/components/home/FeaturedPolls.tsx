import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Poll } from "@/components/polls/PollCard";

interface FeaturedPollsProps {
  polls: Poll[];
}

export function FeaturedPolls({ polls }: FeaturedPollsProps) {
  // Get the first featured poll (trending one) for the large card
  const mainPoll = polls[0];
  const sidePollsData = polls.slice(1, 3);

  if (!mainPoll) return null;

  return (
    <section className="container py-12 sm:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-foreground">
            Featured Polls
          </h2>
          <p className="text-muted-foreground mt-1">
            Hot topics Nigerians are discussing right now
          </p>
        </div>
        <Link to="/polls" className="hidden sm:block">
          <Button variant="ghost" className="gap-2 text-primary">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Main Featured Poll */}
        <Link
          to={`/poll/${mainPoll.id}`}
          className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all hover:shadow-xl"
        >
          <div className="aspect-[16/10] relative">
            <div className="absolute inset-0 gradient-naija opacity-90" />
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              {/* Top */}
              <div className="flex items-center justify-between">
                <Badge className="bg-naija-gold text-foreground border-none gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </Badge>
                <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                  {mainPoll.category}
                </Badge>
              </div>

              {/* Bottom */}
              <div className="space-y-3">
                <h3 className="font-poppins font-bold text-xl sm:text-2xl text-primary-foreground line-clamp-2 group-hover:underline">
                  {mainPoll.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-primary-foreground/80">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {mainPoll.totalVotes.toLocaleString()} votes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {mainPoll.commentsCount} comments
                  </span>
                </div>
                <Button className="w-full sm:w-auto btn-touch bg-card text-primary hover:bg-card/90">
                  View Poll & Vote
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Link>

        {/* Side Polls */}
        <div className="space-y-4">
          {sidePollsData.map((poll, index) => (
            <Link
              key={poll.id}
              to={`/poll/${poll.id}`}
              className="group block bg-card rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-lg transition-all animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <Badge
                  variant="outline"
                  className="text-xs bg-secondary/50 text-secondary-foreground"
                >
                  {poll.category}
                </Badge>
                {poll.isTrending && (
                  <Badge className="text-xs bg-naija-gold/20 text-foreground border-naija-gold/30 gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Hot
                  </Badge>
                )}
              </div>
              <h4 className="font-poppins font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                {poll.title}
              </h4>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {poll.totalVotes.toLocaleString()} votes
                </span>
                <span className="text-primary font-medium">{poll.timeRemaining}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile View All Button */}
      <div className="mt-6 sm:hidden">
        <Link to="/polls">
          <Button variant="outline" className="w-full gap-2">
            View All Featured Polls
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
