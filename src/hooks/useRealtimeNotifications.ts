import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeVotes } from './useRealtimeVotes';
import { useRealtimeComments } from './useRealtimeComments';

export const useRealtimeNotifications = () => {
  const { toast } = useToast();

  // Handle vote notifications for global feed
  const handleVoteNotification = useCallback((pollId: string, votes: any[]) => {
    // Only show notification for new votes (not our own)
    // We can detect this by checking if the vote count increased
    // For simplicity, we'll show a subtle notification for vote activity
    toast({
      title: "New vote! 🗳️",
      description: "Someone just voted in a poll you're following",
      duration: 2000,
    });
  }, [toast]);

  // Handle comment notifications
  const handleCommentNotification = useCallback((pollId: string, comments: any[]) => {
    toast({
      title: "New comment! 💬",
      description: "Someone added a comment to a poll",
      duration: 2000,
    });
  }, [toast]);

  // Use global hooks for notifications (without pollId to get all updates)
  useRealtimeVotes({
    onVoteUpdate: handleVoteNotification,
  });

  useRealtimeComments({
    onCommentUpdate: handleCommentNotification,
  });

  // Note: We could add poll creation notifications here too
};
