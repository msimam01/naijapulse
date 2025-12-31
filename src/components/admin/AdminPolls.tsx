import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Edit,
  Trash2,
  Star,
  BarChart3,
  MessageCircle,
  Calendar,
  User,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminDataTable } from './AdminDataTable';
import { Tables } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';

type Poll = Tables<'polls'>;

interface AdminPollsProps {
  polls: Poll[];
  loading?: boolean;
  onRefresh: () => void;
}

export const AdminPolls: React.FC<AdminPollsProps> = ({
  polls,
  loading = false,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [deletingPoll, setDeletingPoll] = useState<Poll | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleSponsored = async (poll: Poll) => {
    try {
      console.log('Attempting to toggle sponsored status for poll:', poll.id);
      const { error } = await supabase
        .from('polls')
        .update({ is_sponsored: !poll.is_sponsored })
        .eq('id', poll.id);

      if (error) {
        console.error('Sponsored toggle error:', error);
        throw error;
      }

      console.log('Sponsored status updated successfully');
      toast({
        title: 'Success',
        description: `Poll ${!poll.is_sponsored ? 'marked as' : 'unmarked as'} sponsored.`,
      });

      onRefresh();
    } catch (error: any) {
      console.error('Error updating sponsored status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update sponsored status. You may not have admin privileges.',
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (poll: Poll) => {
    setDeletingPoll(poll);
    setDeleteDialogOpen(true);
  };

  const handleDeletePollConfirm = async () => {
    if (!deletingPoll) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', deletingPoll.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Poll deleted successfully.',
      });

      setDeleteDialogOpen(false);
      setDeletingPoll(null);
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting poll:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete poll.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingPoll(null);
  };

  const openEditDialog = (poll: Poll) => {
    setEditingPoll(poll);
    setEditTitle(poll.title);
    setEditDialogOpen(true);
  };

  const handleEditTitleSubmit = async () => {
    if (!editingPoll || !editTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid title.',
        variant: 'destructive',
      });
      return;
    }

    if (editTitle.trim() === editingPoll.title) {
      setEditDialogOpen(false);
      setEditingPoll(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('polls')
        .update({ title: editTitle.trim() })
        .eq('id', editingPoll.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Poll title updated successfully.',
      });

      setEditDialogOpen(false);
      setEditingPoll(null);
      setEditTitle('');
      onRefresh();
    } catch (error: any) {
      console.error('Error updating poll title:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update poll title.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingPoll(null);
    setEditTitle('');
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (value: string, row: Poll) => (
        <div className="space-y-1">
          <div className="font-medium flex items-center gap-2">
            {value}
            {row.is_sponsored && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
          </div>
          <div className="text-sm text-muted-foreground line-clamp-2">
            {row.question}
          </div>
        </div>
      ),
    },
    {
      key: 'creator_name',
      header: 'Creator',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {value}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: 'vote_count',
      header: 'Total Votes',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          {value}
        </div>
      ),
    },
    {
      key: 'comment_count',
      header: 'Total Comments',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {value}
        </div>
      ),
    },
    {
      key: 'is_sponsored',
      header: 'Sponsored',
      sortable: true,
      render: (value: boolean, row: Poll) => (
        <Switch
          checked={value}
          onCheckedChange={() => handleToggleSponsored(row)}
        />
      ),
    },
    {
      key: 'duration_end',
      header: 'Expires',
      sortable: true,
      render: (value: string | null) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : 'No expiry'}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
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
      render: (_: any, row: Poll) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(row)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDeleteDialog(row)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <AdminDataTable
        data={polls}
        columns={columns}
        title="Polls"
        searchPlaceholder="Search polls..."
        loading={loading}
      />

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Quick Actions:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Sponsored Toggle:</strong> Click the switch to mark/unmark polls as sponsored
          </div>
          <div>
            <strong>Edit Title:</strong> Click the edit button to change poll titles
          </div>
          <div>
            <strong>Delete:</strong> Remove polls permanently (use with caution)
          </div>
        </div>
      </div>

      {/* Edit Title Modal */}
      <Dialog open={editDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Poll Title</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_title">Poll Title</Label>
              <Input
                id="edit_title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter new poll title"
              />
            </div>
            {editingPoll && (
              <div className="text-sm text-muted-foreground">
                <strong>Current title:</strong> {editingPoll.title}
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleEditTitleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Updating...' : 'Update Title'}
              </Button>
              <Button
                variant="outline"
                onClick={closeEditDialog}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Poll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Are you sure you want to delete this poll? This action cannot be undone.
            </div>
            {deletingPoll && (
              <div className="bg-muted p-3 rounded-md">
                <div className="font-medium">{deletingPoll.title}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Created by {deletingPoll.creator_name} • {deletingPoll.vote_count} votes • {deletingPoll.comment_count} comments
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={handleDeletePollConfirm}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Poll'}
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
