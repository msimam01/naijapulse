import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Comment = Tables<'comments'>;

interface UseRealtimeCommentsOptions {
  pollId?: string; // If provided, subscribe to specific poll, else global
  onCommentUpdate?: (pollId: string, comments: Comment[]) => void;
}

export const useRealtimeComments = ({ pollId, onCommentUpdate }: UseRealtimeCommentsOptions = {}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch initial comments
  const fetchComments = useCallback(async () => {
    const query = supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });

    if (pollId) {
      query.eq('poll_id', pollId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    setComments(data || []);
  }, [pollId]);

  // Handle comment insert
  const handleCommentInsert = useCallback((payload: any) => {
    const newComment = payload.new as Comment;

    // If pollId specified, only update if it's for this poll
    if (pollId && newComment.poll_id !== pollId) return;

    setComments(prev => {
      // Check if comment already exists
      const exists = prev.find(c => c.id === newComment.id);
      if (exists) return prev;

      const updated = [...prev, newComment].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      onCommentUpdate?.(newComment.poll_id, updated);
      return updated;
    });
  }, [pollId, onCommentUpdate]);

  // Handle comment delete
  const handleCommentDelete = useCallback((payload: any) => {
    const deletedComment = payload.old as Comment;

    if (pollId && deletedComment.poll_id !== pollId) return;

    setComments(prev => {
      const updated = prev.filter(c => c.id !== deletedComment.id);
      onCommentUpdate?.(deletedComment.poll_id, updated);
      return updated;
    });
  }, [pollId, onCommentUpdate]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (isSubscribed) return;

    const channelName = pollId ? `comments:${pollId}` : 'comments:global';
    const channel = supabase.channel(channelName);

    // Subscribe to inserts
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      ...(pollId && { filter: `poll_id=eq.${pollId}` }),
    }, handleCommentInsert);

    // Subscribe to deletes
    channel.on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'comments',
      ...(pollId && { filter: `poll_id=eq.${pollId}` }),
    }, handleCommentDelete);

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsSubscribed(true);
      }
    });

    // Fetch initial data
    fetchComments();

    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [pollId, handleCommentInsert, handleCommentDelete, fetchComments, isSubscribed]);

  return { comments, refetch: fetchComments };
};
