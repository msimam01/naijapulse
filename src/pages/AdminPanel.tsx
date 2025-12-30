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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { formatDistanceToNow } from "date-fns";

type Report = Tables<'reports'>;

interface ReportWithContent extends Report {
  poll_title?: string;
  poll_question?: string;
  comment_content?: string;
  creator_name?: string;
}

const ADMIN_UID = 'your-admin-uid-here'; // Replace with actual admin user ID

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportWithContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

  // Check if user is admin
  const isAdmin = user?.id === ADMIN_UID;

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      window.location.href = '/';
      return;
    }
  }, [isAdmin, loading]);

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

  return (
    <div className="container py-6 sm:py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-up">
          <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-foreground">
              Admin Moderation
            </h1>
            <p className="text-muted-foreground">
              Review and manage reported content
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-fade-up delay-100">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-naija-gold" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{reports.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {reports.filter((r) => r.status === "resolved").length}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Dismissed</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {reports.filter((r) => r.status === "dismissed").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 animate-fade-up delay-200">
          {(["all", "pending", "resolved"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Reports List */}
        <div className="space-y-4 animate-fade-up delay-300">
          {filteredReports.map((report) => (
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
                    <Badge
                      variant="secondary"
                      className="bg-naija-gold/20 text-foreground"
                    >
                      Pending
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

          {filteredReports.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports to show</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
