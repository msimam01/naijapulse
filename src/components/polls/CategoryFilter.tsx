import { TrendingUp, Clock, Sparkles, LayoutGrid, Trophy, Film, Wallet, Heart, Dumbbell, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

const categories = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "Politics", label: "Politics", icon: Trophy },
  { id: "Entertainment", label: "Entertainment", icon: Film },
  { id: "Economy", label: "Economy", icon: Wallet },
  { id: "Lifestyle", label: "Lifestyle", icon: Heart },
  { id: "Sports", label: "Sports", icon: Dumbbell },
  { id: "Technology", label: "Technology", icon: Smartphone },
];

const sortOptions = [
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "ending", label: "Ending Soon", icon: Clock },
  { id: "new", label: "Newest", icon: Sparkles },
];

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
}: CategoryFilterProps) {
  return (
    <div className="space-y-4">
      {/* Sort Options */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-poppins font-semibold text-sm text-foreground mb-3">Sort By</h3>
        <div className="space-y-1">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSortChange(option.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedSort === option.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <option.icon className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-poppins font-semibold text-sm text-foreground mb-3">Categories</h3>
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoryFilterMobile({
  selectedCategory,
  onCategoryChange,
}: {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className="shrink-0 gap-1.5"
        >
          <category.icon className="h-3.5 w-3.5" />
          {category.label}
        </Button>
      ))}
    </div>
  );
}
