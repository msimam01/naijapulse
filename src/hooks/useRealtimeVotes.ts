import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Vote = Tables<'votes'>;

interface UseRealtimeVotesOptions {
  pollId?: string; // If provided, subscribe to specific poll, else global
  onVoteUpdate?: (pollId: string, votes: Vote[]) => void;
}

export const useRealtimeVotes = ({ pollId, onVoteUpdate }: UseRealtimeVotesOptions = {}) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch initial votes
  const fetchVotes = useCallback(async () => {
    const query = supabase.from('votes').select('*');
    if (pollId) {
      query.eq('poll_id', pollId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching votes:', error);
      return;
    }

    setVotes(data || []);
  }, [pollId]);

  // Handle vote insert
  const handleVoteInsert = useCallback((payload: any) => {
    const newVote = payload.new as Vote;

    // If pollId specified, only update if it's for this poll
    if (pollId && newVote.poll_id !== pollId) return;

    setVotes(prev => {
      // Check if vote already exists (prevent duplicates)
      const exists = prev.find(v =>
        v.poll_id === newVote.poll_id &&
        v.user_id === newVote.user_id &&
        v.guest_id === newVote.guest_id
      );

      if (exists) return prev;

      const updated = [...prev, newVote];
      onVoteUpdate?.(newVote.poll_id, updated);
      return updated;
    });
  }, [pollId, onVoteUpdate]);

  // Handle vote delete (if needed for future features)
  const handleVoteDelete = useCallback((payload: any) => {
    const deletedVote = payload.old as Vote;

    if (pollId && deletedVote.poll_id !== pollId) return;

    setVotes(prev => {
      const updated = prev.filter(v =>
        !(v.poll_id === deletedVote.poll_id &&
          v.user_id === deletedVote.user_id &&
          v.guest_id === deletedVote.guest_id)
      );
      onVoteUpdate?.(deletedVote.poll_id, updated);
      return updated;
    });
  }, [pollId, onVoteUpdate]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (isSubscribed) return;

    const channelName = pollId ? `votes:${pollId}` : 'votes:global';
    const channel = supabase.channel(channelName);

    // Subscribe to inserts
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'votes',
      ...(pollId && { filter: `poll_id=eq.${pollId}` }),
    }, handleVoteInsert);

    // Subscribe to deletes (for future use)
    channel.on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'votes',
      ...(pollId && { filter: `poll_id=eq.${pollId}` }),
    }, handleVoteDelete);

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsSubscribed(true);
      }
    });

    // Fetch initial data
    fetchVotes();

    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [pollId, handleVoteInsert, handleVoteDelete, fetchVotes, isSubscribed]);

  return { votes, refetch: fetchVotes };
};
