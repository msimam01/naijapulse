import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Poll } from "@/components/polls/PollCard";
import { useLanguage } from "@/hooks/useLanguage";

const sidebarItems = [
  { id: "my-polls", label: "My Polls", icon: LayoutDashboard },
  { id: "created", label: "Created", icon: PlusCircle },
  { id: "voted", label: "Voted", icon: Vote },
  { id: "settings", label: "Settings", icon: Settings },
];

type SupabasePoll = Tables<'polls'>;

export default function Dashboard() {
  const { user } = useAuth();
  const { t, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my-polls");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPolls: 0, totalVotes: 0, totalComments: 0 });
  const [displayName, setDisplayName] = useState("");
  const [updating, setUpdating] = useState(false);

  // Check if user is admin and redirect if so
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

          if (!error && profile?.is_admin) {
            console.log('Dashboard: Admin user detected, redirecting to /admin');
            navigate('/admin');
            return;
          }
        } catch (error) {
          console.error('Dashboard: Error checking admin status:', error);
        }
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  // Convert Supabase poll to Poll interface
  const mapPoll = (poll: SupabasePoll): Poll => {
    const options = Array.isArray(poll.options) ? poll.options as string[] : [];
    const now = new Date();
    const end = poll.duration_end ? new Date(poll.duration_end) : null;
    const timeRemaining = end ?
      (end > now ? `${Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60))}h` : "Ended") :
      "Ongoing";

    return {
      id: poll.id,
      title: poll.title,
      question: poll.question,
      category: poll.category,
      options,
      totalVotes: poll.vote_count || 0,
      commentsCount: poll.comment_count || 0,
      timeRemaining,
      createdBy: poll.creator_name,
      isTrending: false,
      is_sponsored: poll.is_sponsored || false,
      image_url: poll.image_url,
    };
  };

  // Fetch data based on tab
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      if (activeTab === "created" || activeTab === "my-polls") {
        const { data, error } = await supabase
          .from('polls')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPolls(data.map(mapPoll));
        }
      } else if (activeTab === "voted") {
        // Get poll IDs where user voted
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('poll_id')
          .eq('user_id', user.id);

        if (!votesError && votesData) {
          const pollIds = [...new Set(votesData.map(v => v.poll_id))];
          if (pollIds.length > 0) {
            const { data: pollsData, error: pollsError } = await supabase
              .from('polls')
              .select('*')
              .in('id', pollIds)
              .order('created_at', { ascending: false });

            if (!pollsError && pollsData) {
              setPolls(pollsData.map(mapPoll));
            }
          } else {
            setPolls([]);
          }
        }
      } else if (activeTab === "settings") {
        // Load current display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          setDisplayName(profile.display_name || "");
        }
      }

      // Fetch stats for my-polls tab
      if (activeTab === "my-polls") {
        // Count polls created by user
        const { data: userPolls, error: pollsError } = await supabase
          .from('polls')
          .select('id')
          .eq('creator_id', user.id);

        if (pollsError) {
          console.error('Error fetching user polls:', pollsError);
        }

        const totalPolls = userPolls?.length || 0;

        // Count votes cast by user
        const { data: userVotes, error: votesError } = await supabase
          .from('votes')
          .select('id')
          .eq('user_id', user.id);

        if (votesError) {
          console.error('Error fetching user votes:', votesError);
        }

        const totalVotes = userVotes?.length || 0;

        // Count comments made by user
        const { data: userComments, error: commentsError } = await supabase
          .from('comments')
          .select('id')
          .eq('user_id', user.id);

        if (commentsError) {
          console.error('Error fetching user comments:', commentsError);
        }

        const totalComments = userComments?.length || 0;

        setStats({
          totalPolls,
          totalVotes,
          totalComments,
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [user, activeTab]);

  // Handle settings update
  const handleUpdateSettings = async () => {
    if (!user) return;

    setUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', user.id);

    if (!error) {
      // Success
    }
    setUpdating(false);
  };

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
                    <p className="text-2xl font-bold text-foreground">{stats.totalPolls}</p>
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
                    <p className="text-2xl font-bold text-foreground">{stats.totalVotes}</p>
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
                    <p className="text-2xl font-bold text-foreground">{stats.totalComments}</p>
                    <p className="text-sm text-muted-foreground">Comments</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Polls List */}
          {(activeTab === "my-polls" || activeTab === "created" || activeTab === "voted") && (
            <div className="space-y-4 animate-fade-up delay-200">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : polls.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {activeTab === "voted" ? "You haven't voted on any polls yet." : "No polls found."}
                  </p>
                </div>
              ) : (
                polls.map((poll) => (
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
                          {activeTab !== "voted" && (
                            <>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Settings Content */}
          {activeTab === "settings" && (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-up delay-100">
              <h2 className="font-poppins font-semibold text-lg text-foreground mb-6">
                Account Settings
              </h2>

              <div className="space-y-6">
                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>

                {/* Language Preference */}
                <div className="space-y-2">
                  <Label>Language Preference</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={t("language") === "en" ? "default" : "outline"}
                      onClick={() => setLanguage("en")}
                      size="sm"
                    >
                      English
                    </Button>
                    <Button
                      variant={t("language") === "pidgin" ? "default" : "outline"}
                      onClick={() => setLanguage("pidgin")}
                      size="sm"
                    >
                      Pidgin
                    </Button>
                  </div>
                </div>

                {/* Save Button */}
                <Button onClick={handleUpdateSettings} disabled={updating} className="w-full sm:w-auto">
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
