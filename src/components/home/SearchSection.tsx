import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log("Searching for:", query);
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
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-14 text-base rounded-xl border-2 border-border focus:border-primary bg-card"
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
                onClick={() => handleSearch(term)}
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
