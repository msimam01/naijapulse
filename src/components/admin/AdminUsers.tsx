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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  UserPlus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminDataTable } from './AdminDataTable';
import { UserWithAuth } from '@/hooks/useAdminData';
import { formatDistanceToNow } from 'date-fns';

interface AdminUsersProps {
  users: UserWithAuth[];
  loading?: boolean;
  onRefresh: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  loading = false,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithAuth | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithAuth | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for add/edit user
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    display_name: '',
    is_admin: false,
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      display_name: '',
      is_admin: false,
    });
    setEditingUser(null);
  };

  const openEditDialog = (user: UserWithAuth) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      password: '', // Don't populate password for security
      display_name: user.display_name,
      is_admin: user.is_admin,
    });
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.password || !formData.display_name) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            display_name: formData.display_name,
            is_admin: formData.is_admin,
          });

        if (profileError) throw profileError;

        toast({
          title: 'Success',
          description: 'User created successfully.',
        });

        setAddUserDialog(false);
        resetForm();
        onRefresh();
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser || !formData.display_name) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          is_admin: formData.is_admin,
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User updated successfully.',
      });

      setEditingUser(null);
      resetForm();
      onRefresh();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (user: UserWithAuth) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;

    setIsSubmitting(true);
    try {
      // Delete profile (cascade will handle auth.users)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deletingUser.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User deleted successfully.',
      });

      setDeleteDialogOpen(false);
      setDeletingUser(null);
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const columns = [
    {
      key: 'display_name',
      header: 'Name',
      sortable: true,
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      ),
    },
    {
      key: 'email',
      header: 'Email/Phone',
      sortable: true,
      render: (value: string, row: UserWithAuth) => (
        <div className="space-y-1">
          {value && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {value}
            </div>
          )}
          {row.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'is_admin',
      header: 'Role',
      sortable: true,
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? (
            <>
              <ShieldCheck className="h-3 w-3 mr-1" />
              Admin
            </>
          ) : (
            <>
              <Shield className="h-3 w-3 mr-1" />
              User
            </>
          )}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
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
      render: (_: any, row: UserWithAuth) => (
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
      <Dialog open={addUserDialog} onOpenChange={setAddUserDialog}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_admin"
                checked={formData.is_admin}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_admin: checked }))}
              />
              <Label htmlFor="is_admin">Admin privileges</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAddUser}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAddUserDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AdminDataTable
        data={users}
        columns={columns}
        title="Users"
        searchPlaceholder="Search users..."
        loading={loading}
      />

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="edit_display_name">Display Name *</Label>
              <Input
                id="edit_display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_admin"
                checked={formData.is_admin}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_admin: checked }))}
              />
              <Label htmlFor="edit_is_admin">Admin privileges</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleEditUser}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Updating...' : 'Update User'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingUser(null);
                  resetForm();
                }}
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
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Are you sure you want to delete this user? This action cannot be undone and will permanently remove their account and all associated data.
            </div>
            {deletingUser && (
              <div className="bg-muted p-3 rounded-md">
                <div className="font-medium">{deletingUser.display_name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {deletingUser.email || deletingUser.phone} • {deletingUser.is_admin ? 'Admin' : 'User'}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={handleDeleteUserConfirm}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Deleting...' : 'Delete User'}
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
