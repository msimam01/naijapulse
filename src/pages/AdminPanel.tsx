import { useState } from "react";
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

interface Report {
  id: string;
  type: "poll" | "comment";
  title: string;
  reason: string;
  reportedBy: string;
  reportedAt: string;
  status: "pending" | "resolved" | "dismissed";
}

const mockReports: Report[] = [
  {
    id: "r1",
    type: "poll",
    title: "Inappropriate poll about celebrities",
    reason: "Contains defamatory content",
    reportedBy: "User123",
    reportedAt: "2 hours ago",
    status: "pending",
  },
  {
    id: "r2",
    type: "comment",
    title: "Offensive comment on 2027 Election poll",
    reason: "Hate speech",
    reportedBy: "NaijaPatriot",
    reportedAt: "5 hours ago",
    status: "pending",
  },
  {
    id: "r3",
    type: "poll",
    title: "Spam poll promoting products",
    reason: "Spam/Advertising",
    reportedBy: "LagosGirl",
    reportedAt: "1 day ago",
    status: "pending",
  },
  {
    id: "r4",
    type: "comment",
    title: "Threatening message to other user",
    reason: "Threats/Harassment",
    reportedBy: "AbujaVibes",
    reportedAt: "2 days ago",
    status: "resolved",
  },
];

export default function AdminPanel() {
  const { toast } = useToast();
  const [reports, setReports] = useState(mockReports);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

  const filteredReports = reports.filter((report) => {
    if (filter === "all") return true;
    if (filter === "pending") return report.status === "pending";
    if (filter === "resolved") return report.status === "resolved" || report.status === "dismissed";
    return true;
  });

  const handleAction = (id: string, action: "delete" | "edit" | "dismiss") => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === id
          ? {
              ...report,
              status: action === "dismiss" ? "dismissed" : "resolved",
            }
          : report
      )
    );

    toast({
      title:
        action === "delete"
          ? "Content deleted"
          : action === "edit"
          ? "Content edited"
          : "Report dismissed",
      description: `The ${action === "dismiss" ? "report has been dismissed" : "content has been " + action + "d"}.`,
    });
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;

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
                        report.type === "poll"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-secondary text-secondary-foreground"
                      }
                    >
                      {report.type === "poll" ? (
                        <BarChart3 className="h-3 w-3 mr-1" />
                      ) : (
                        <MessageCircle className="h-3 w-3 mr-1" />
                      )}
                      {report.type}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={
                        report.status === "pending"
                          ? "bg-naija-gold/20 text-foreground"
                          : report.status === "resolved"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {report.status}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{report.title}</h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      <strong>Reason:</strong> {report.reason}
                    </span>
                    <span>
                      <strong>By:</strong> {report.reportedBy}
                    </span>
                    <span>{report.reportedAt}</span>
                  </div>
                </div>

                {report.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleAction(report.id, "edit")}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleAction(report.id, "delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleAction(report.id, "dismiss")}
                    >
                      <X className="h-3.5 w-3.5" />
                      Dismiss
                    </Button>
                  </div>
                )}
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
