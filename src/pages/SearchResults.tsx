import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ArrowLeft, Clock, MessageCircle, Users, TrendingUp, Share2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { ReportModal } from "@/components/ui/ReportModal";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/hooks/useLanguage";

type Poll = Tables<'polls'>;

interface SearchResultCardProps {
  poll: Poll;
  query: string;
  highlightText: (text: string, query: string) => any;
}

function SearchResultCard({ poll, query, highlightText }: SearchResultCardProps) {
  const categoryColors: Record<string, string> = {
    Politics: "bg-destructive/10 text-destructive border-destructive/20",
    Entertainment: "bg-accent/20 text-accent-foreground border-accent/30",
    Economy: "bg-primary/10 text-primary border-primary/20",
    Lifestyle: "bg-secondary text-secondary-foreground border-secondary",
    Sports: "bg-naija-gold/20 text-foreground border-naija-gold/30",
    Technology: "bg-primary/15 text-primary border-primary/25",
  };

  // Parse options from Json type
  const options = Array.isArray(poll.options) ? poll.options.slice(0, 3) : [];

  return (
    <Link
      to={`/poll/${poll.id}`}
      className="block animate-fade-up"
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
            </div>
            <h3 className="font-poppins font-semibold text-base sm:text-lg text-foreground line-clamp-2">
              {highlightText(poll.title, query)}
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
        <p className="text-sm text-muted-foreground line-clamp-2">
          {highlightText(poll.question, query)}
        </p>

        {/* Options Preview */}
        <div className="space-y-2">
          {options.map((option, idx) => (
            <div key={idx} className="relative">
              <div className="relative h-10 bg-secondary rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-sm font-medium text-foreground truncate pr-2">
                    {typeof option === 'string' ? option : (typeof option === 'object' && option && 'text' in option && typeof option.text === 'string' ? option.text : String(option))}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {Array.isArray(poll.options) && poll.options.length > 3 && (
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
                {poll.vote_count?.toLocaleString() || 0} votes
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {poll.comment_count || 0}
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <Clock className="h-3.5 w-3.5" />
              Active
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div
              onClick={(e) => e.preventDefault()}
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
              onClick={(e) => e.preventDefault()}
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

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { t } = useLanguage();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim()) {
      searchPolls(query.trim());
    } else {
      setPolls([]);
    }
  }, [query]);

  const searchPolls = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      // Use Supabase .or() with .ilike() for case-insensitive partial matching
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,question.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Search error:', error);
        setError('Failed to search polls');
        return;
      }

      setPolls(data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder={t("common.search")}
              size="lg"
              autoFocus
              className="w-full"
            />
          </div>
        </div>

        {query && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-4 w-4" />
            <span className="text-sm">
              Search results for "<strong>{query}</strong>"
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              Searching...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{error}</p>
            </div>
            <Button onClick={() => query && searchPolls(query)} variant="outline">
              Try Again
            </Button>
          </div>
        ) : !query ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Enter a search term to find polls
            </p>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">
              No polls found for "<strong>{query}</strong>"
            </p>
            <p className="text-sm text-muted-foreground">
              Try searching for different keywords or check the spelling
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {polls.length} poll{polls.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {polls.map((poll) => (
                <SearchResultCard
                  key={poll.id}
                  poll={poll}
                  query={query}
                  highlightText={highlightText}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
