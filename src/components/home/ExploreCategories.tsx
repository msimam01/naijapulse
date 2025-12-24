import { Link } from "react-router-dom";
import { 
  Landmark, 
  Music, 
  TrendingUp, 
  Utensils, 
  Trophy, 
  Briefcase,
  ArrowRight
} from "lucide-react";

const categories = [
  {
    name: "Politics",
    icon: Landmark,
    count: "12.5K",
    gradient: "from-red-500/20 to-red-600/10",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    name: "Entertainment",
    icon: Music,
    count: "18.2K",
    gradient: "from-purple-500/20 to-purple-600/10",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    name: "Economy",
    icon: TrendingUp,
    count: "8.9K",
    gradient: "from-primary/20 to-primary/10",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
  {
    name: "Food & Culture",
    icon: Utensils,
    count: "22.1K",
    gradient: "from-orange-500/20 to-orange-600/10",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    name: "Sports",
    icon: Trophy,
    count: "15.7K",
    gradient: "from-naija-gold/30 to-naija-gold/10",
    iconBg: "bg-naija-gold/30",
    iconColor: "text-foreground",
  },
  {
    name: "Business",
    icon: Briefcase,
    count: "6.3K",
    gradient: "from-blue-500/20 to-blue-600/10",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
];

export function ExploreCategories() {
  return (
    <section id="categories" className="container py-12 sm:py-16">
      <div className="text-center mb-10">
        <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-foreground">
          Explore Categories
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Discover what Nigerians are saying across different topics
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <Link
            key={category.name}
            to={`/category/${category.name.toLowerCase()}`}
            className={`group relative bg-gradient-to-br ${category.gradient} rounded-xl p-5 border border-border hover:border-primary/30 hover:shadow-lg transition-all animate-fade-up`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Icon */}
            <div className={`${category.iconBg} h-12 w-12 rounded-lg flex items-center justify-center mb-4`}>
              <category.icon className={`h-6 w-6 ${category.iconColor}`} />
            </div>

            {/* Content */}
            <h3 className="font-poppins font-semibold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {category.count} polls
            </p>

            {/* Hover Arrow */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
