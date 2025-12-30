import { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  MessageCircle,
  BarChart3,
  Check,
  X,
  Eye,
  Trash2,
  Edit,
  Users,
  FileText,
  Loader2,
  UserPlus,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Report = Tables<'reports'>;
type Profile = Tables<'profiles'>;
type Poll = Tables<'polls'>;

interface ReportWithContent extends Report {
  poll_title?: string;
  poll_question?: string;
  comment_content?: string;
  creator_name?: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"users" | "polls" | "reports">("reports");
  const [reports, setReports] = useState<ReportWithContent[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setLoading(false);
          window.location.href = '/';
          return;
        }

        const admin = profile?.is_admin || false;
        setIsAdmin(admin);

        if (!admin) {
          setLoading(false);
          window.location.href = '/';
          return;
        }

        // If admin, keep loading true until data is fetched
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
        setLoading(false);
        window.location.href = '/';
        return;
      }
    };

    checkAdmin();
  }, [user]);

  const fetchReports = async () => {
    try {
      const { data: reportsData, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich reports with content preview
      const enrichedReports: ReportWithContent[] = await Promise.all(
        reportsData.map(async (report) => {
          if (report.target_type === 'poll') {
            const { data: poll } = await supabase
              .from('polls')
              .select('title, question, creator_name')
              .eq('id', report.target_id)
              .single();

            return {
              ...report,
              poll_title: poll?.title,
              poll_question: poll?.question,
              creator_name: poll?.creator_name,
            };
          } else if (report.target_type === 'comment') {
            const { data: comment } = await supabase
              .from('comments')
              .select('content, creator_name')
              .eq('id', parseInt(report.target_id))
              .single();

            return {
              ...report,
              comment_content: comment?.content,
              creator_name: comment?.creator_name,
            };
          }
          return report;
        })
      );

      setReports(enrichedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin]);

  const filteredReports = reports.filter((report) => {
    if (filter === "all") return true;
    // For now, all reports are "pending" since we don't have a status field
    // In future, add status field to reports table
    return true;
  });

  const handleDelete = async (report: ReportWithContent) => {
    try {
      if (report.target_type === 'poll') {
        const { error } = await supabase
          .from('polls')
          .delete()
          .eq('id', report.target_id);

        if (error) throw error;
      } else if (report.target_type === 'comment') {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', parseInt(report.target_id));

        if (error) throw error;
      }

      // Remove the report
      const { error: reportError } = await supabase
        .from('reports')
        .delete()
        .eq('id', report.id);

      if (reportError) throw reportError;

      setReports(prev => prev.filter(r => r.id !== report.id));
      toast({
        title: "Content deleted",
        description: `The ${report.target_type} has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content.",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = async (report: ReportWithContent) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', report.id);

      if (error) throw error;

      setReports(prev => prev.filter(r => r.id !== report.id));
      toast({
        title: "Report dismissed",
        description: "The report has been dismissed.",
      });
    } catch (error) {
      console.error('Error dismissing report:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss report.",
        variant: "destructive",
      });
    }
  };

  // Show loading or redirect for non-admin
  if (loading) {
    return (
      <div className="container py-6 sm:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  const pendingCount = reports.length; // All reports are pending for now

  const sidebarItems = [
    { id: "users", label: "Users", icon: Users },
    { id: "polls", label: "Polls", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: AlertTriangle },
  ];

  return (
    <div className="container py-6 sm:py-10">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
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
                onClick={() => setActiveTab(item.id as any)}
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
                {activeTab === "users"
                  ? "Users"
                  : activeTab === "polls"
                  ? "Polls"
                  : "Reports"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {activeTab === "users"
                  ? "Manage user accounts and permissions"
                  : activeTab === "polls"
                  ? "Review and manage polls"
                  : "Review and manage reported content"}
              </p>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "reports" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-naija-gold" />
                  <span className="text-xs text-muted-foreground">Reports</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{reports.length}</p>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-card rounded-xl border border-border p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={
                            report.target_type === "poll"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-secondary text-secondary-foreground"
                          }
                        >
                          {report.target_type === "poll" ? (
                            <BarChart3 className="h-3 w-3 mr-1" />
                          ) : (
                            <MessageCircle className="h-3 w-3 mr-1" />
                          )}
                          {report.target_type}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-foreground mb-1">
                        {report.target_type === 'poll' ? report.poll_title : report.comment_content?.slice(0, 100) + '...'}
                      </h3>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        {report.target_type === 'poll' && report.poll_question && (
                          <p className="text-xs italic">{report.poll_question.slice(0, 150)}...</p>
                        )}
                        {report.details && (
                          <p className="text-xs italic">"{report.details}"</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            <strong>Reason:</strong> {report.reason}
                          </span>
                          <span>
                            <strong>Creator:</strong> {report.creator_name || 'Unknown'}
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleDelete(report)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleDismiss(report)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {reports.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reports to show</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "users" && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Users management coming soon</p>
          </div>
        )}

          {activeTab === "polls" && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Polls management coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
