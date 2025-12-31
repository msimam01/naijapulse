import { useNavigate } from "react-router-dom";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/badge";

const popularSearches = [
  "election 2027",
  "fuel price",
  "afrobeats",
  "super eagles",
  "naira",
  "asuu strike",
  "jollof rice",
  "lagos traffic",
];

export function SearchSection() {
  const navigate = useNavigate();

  const handlePopularSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section id="search" className="container py-12 sm:py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-foreground mb-2">
          Find polls wey interest you
        </h2>
        <p className="text-muted-foreground mb-6">
          Search for any topic you want to explore
        </p>

        {/* Search Input */}
        <div className="mb-6">
          <SearchInput
            placeholder="Search polls..."
            size="lg"
            className="w-full max-w-md mx-auto"
          />
        </div>

        {/* Popular Searches */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Popular:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearches.map((term) => (
              <Badge
                key={term}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5 text-sm"
                onClick={() => handlePopularSearch(term)}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
