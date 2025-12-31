import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  size?: "sm" | "lg";
  showClear?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({
  placeholder = "Search polls...",
  className = "",
  size = "sm",
  showClear = true,
  autoFocus = false
}: SearchInputProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Navigate to search results when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
    }
  }, [debouncedQuery, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (searchParams.get("q")) {
      navigate("/search");
    }
  };

  const inputSize = size === "lg" ? "h-14 text-base pl-12 pr-12" : "h-10 pl-10 pr-10";

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${size === "lg" ? "h-5 w-5 left-4" : ""}`} />
      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`${inputSize} bg-secondary border-0 focus-visible:ring-primary`}
        autoFocus={autoFocus}
      />
      {showClear && query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`absolute top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-secondary/50 ${size === "lg" ? "right-4 h-8 w-8" : "right-2"}`}
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </form>
  );
}
