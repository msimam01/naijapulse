import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Eye,
  Trash2,
  X,
  AlertTriangle,
  BarChart3,
  MessageCircle,
  User,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminDataTable } from './AdminDataTable';
import { ReportWithContent } from '@/hooks/useAdminData';
import { formatDistanceToNow } from 'date-fns';

interface AdminReportsProps {
  reports: ReportWithContent[];
  loading?: boolean;
  onRefresh: () => void;
}

export const AdminReports: React.FC<AdminReportsProps> = ({
  reports,
  loading = false,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingReport, setDeletingReport] = useState<ReportWithContent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleViewTarget = async (report: ReportWithContent) => {
    // Open target in new tab
    if (report.target_type === 'poll') {
      window.open(`/poll/${report.target_id}`, '_blank');
    } else if (report.target_type === 'comment') {
      // For comments, we need to find the poll first
      try {
        const { data: comment } = await supabase
          .from('comments')
          .select('poll_id')
          .eq('id', parseInt(report.target_id))
          .single();

        if (comment) {
          window.open(`/poll/${comment.poll_id}`, '_blank');
        }
      } catch (error) {
        console.error('Error finding comment poll:', error);
        toast({
          title: 'Error',
          description: 'Could not find the related poll.',
          variant: 'destructive',
        });
      }
    }
  };

  const openDeleteDialog = (report: ReportWithContent) => {
    setDeletingReport(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTargetConfirm = async () => {
    if (!deletingReport) return;

    setIsSubmitting(true);
    try {
      if (deletingReport.target_type === 'poll') {
        const { error } = await supabase
          .from('polls')
          .delete()
          .eq('id', deletingReport.target_id);

        if (error) throw error;
      } else if (deletingReport.target_type === 'comment') {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', parseInt(deletingReport.target_id));

        if (error) throw error;
      }

      // Remove the report
      const { error: reportError } = await supabase
        .from('reports')
        .delete()
        .eq('id', deletingReport.id);

      if (reportError) throw reportError;

      toast({
        title: 'Content deleted',
        description: `The ${deletingReport.target_type} has been removed.`,
      });

      setDeleteDialogOpen(false);
      setDeletingReport(null);
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting content:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete content.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingReport(null);
  };

  const handleDismissReport = async (report: ReportWithContent) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', report.id);

      if (error) throw error;

      toast({
        title: 'Report dismissed',
        description: 'The report has been dismissed.',
      });

      onRefresh();
    } catch (error: any) {
      console.error('Error dismissing report:', error);
      toast({
        title: 'Error',
        description: 'Failed to dismiss report.',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'target_type',
      header: 'Type',
      sortable: true,
      render: (value: string) => (
        <Badge
          variant="outline"
          className={
            value === "poll"
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-secondary text-secondary-foreground"
          }
        >
          {value === "poll" ? (
            <BarChart3 className="h-3 w-3 mr-1" />
          ) : (
            <MessageCircle className="h-3 w-3 mr-1" />
          )}
          {value}
        </Badge>
      ),
    },
    {
      key: 'content',
      header: 'Content',
      sortable: false,
      render: (_: any, row: ReportWithContent) => (
        <div className="max-w-xs">
          <div className="font-medium text-sm">
            {row.target_type === 'poll' ? row.poll_title : row.comment_content?.slice(0, 50) + '...'}
          </div>
          {row.target_type === 'poll' && row.poll_question && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {row.poll_question.slice(0, 80)}...
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      sortable: true,
      render: (value: string) => (
        <Badge variant="destructive" className="text-xs">
          {value}
        </Badge>
      ),
    },
    {
      key: 'creator_name',
      header: 'Creator',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm">
          <User className="h-3 w-3" />
          {value || 'Unknown'}
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      sortable: false,
      render: (value: string | null) => (
        <div className="max-w-xs text-xs text-muted-foreground">
          {value ? `"${value}"` : 'No details provided'}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Reported',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(value), { addSuffix: true })}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: ReportWithContent) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewTarget(row)}
            title="View target content"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDeleteDialog(row)}
            title={`Delete ${row.target_type}`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDismissReport(row)}
            title="Dismiss report"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <AdminDataTable
        data={reports}
        columns={columns}
        title="Reports"
        searchPlaceholder="Search reports..."
        loading={loading}
      />

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Moderation Actions:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>View Target:</strong> Opens the reported content in a new tab
          </div>
          <div>
            <strong>Delete Target:</strong> Permanently removes the poll or comment
          </div>
          <div>
            <strong>Dismiss Report:</strong> Removes the report without deleting content
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reported Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Are you sure you want to delete this {deletingReport?.target_type}? This action cannot be undone and will permanently remove the content and the associated report.
            </div>
            {deletingReport && (
              <div className="bg-muted p-3 rounded-md">
                <div className="font-medium text-sm">
                  {deletingReport.target_type === 'poll' ? 'Poll:' : 'Comment:'} {deletingReport.target_type === 'poll' ? deletingReport.poll_title : deletingReport.comment_content?.slice(0, 100) + '...'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Reason: {deletingReport.reason} • Creator: {deletingReport.creator_name || 'Unknown'}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={handleDeleteTargetConfirm}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Deleting...' : `Delete ${deletingReport?.target_type}`}
              </Button>
              <Button
                variant="outline"
                onClick={closeDeleteDialog}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
