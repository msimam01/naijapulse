import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Vote,
  Settings,
  BarChart3,
  MessageCircle,
  Clock,
  MoreVertical,
  Eye,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockPolls } from "@/data/mockPolls";

const sidebarItems = [
  { id: "my-polls", label: "My Polls", icon: LayoutDashboard },
  { id: "created", label: "Created", icon: PlusCircle },
  { id: "voted", label: "Voted", icon: Vote },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("my-polls");

  const userPolls = mockPolls.slice(0, 4);

  return (
    <div className="container py-6 sm:py-10">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Tabs */}
          <div className="flex md:hidden gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className="shrink-0 gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-up">
            <div>
              <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-foreground">
                {activeTab === "my-polls"
                  ? "My Polls"
                  : activeTab === "created"
                  ? "Created Polls"
                  : activeTab === "voted"
                  ? "Voted Polls"
                  : "Settings"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {activeTab === "my-polls"
                  ? "Manage all your polls in one place"
                  : activeTab === "created"
                  ? "Polls you've created"
                  : activeTab === "voted"
                  ? "Polls you've participated in"
                  : "Manage your account settings"}
              </p>
            </div>
            <Link to="/create">
              <Button className="btn-touch gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">New Poll</span>
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          {activeTab === "my-polls" && (
            <div className="grid sm:grid-cols-3 gap-4 mb-8 animate-fade-up delay-100">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">4</p>
                    <p className="text-sm text-muted-foreground">Total Polls</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-naija-gold/20 flex items-center justify-center">
                    <Vote className="h-5 w-5 text-naija-gold" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">12,540</p>
                    <p className="text-sm text-muted-foreground">Total Votes</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">892</p>
                    <p className="text-sm text-muted-foreground">Comments</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Polls List */}
          {(activeTab === "my-polls" || activeTab === "created") && (
            <div className="space-y-4 animate-fade-up delay-200">
              {userPolls.map((poll) => (
                <div
                  key={poll.id}
                  className="bg-card rounded-xl border border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {poll.category}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          poll.timeRemaining.includes("hour")
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {poll.timeRemaining}
                      </Badge>
                    </div>
                    <h3 className="font-poppins font-semibold text-foreground mb-1 line-clamp-1">
                      {poll.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {poll.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-8 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-foreground">
                        {poll.totalVotes.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Votes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{poll.commentsCount}</p>
                      <p className="text-xs text-muted-foreground">Comments</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/poll/${poll.id}`} className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Poll
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings Content */}
          {activeTab === "settings" && (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-up delay-100">
              <h2 className="font-poppins font-semibold text-lg text-foreground mb-4">
                Account Settings
              </h2>
              <p className="text-muted-foreground">
                Settings functionality coming soon. You'll be able to update your profile,
                notification preferences, and more.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
