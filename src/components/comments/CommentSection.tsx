import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { Flag, MessageCircle, Reply, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ReportModal } from "@/components/ui/ReportModal";
import { useRealtimeComments } from "@/hooks/useRealtimeComments";

type Comment = Tables<'comments'>;

interface CommentSectionProps {
  pollId: string;
  onCommentCountChange?: (count: number) => void;
}

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

export default function CommentSection({ pollId, onCommentCountChange }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  // Guest ID for unauthenticated users
  const getGuestId = () => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  };

  // Get creator name (user display_name or Guest)
  const getCreatorName = async () => {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      return profile?.display_name || user.email || 'Anonymous';
    }
    return 'Guest';
  };

  // Organize comments into threaded structure
  const organizeComments = useCallback((flatComments: Comment[]): CommentWithReplies[] => {
    const topLevelComments: CommentWithReplies[] = [];
    const commentMap = new Map<number, CommentWithReplies>();

    flatComments.forEach(comment => {
      const commentWithReplies: CommentWithReplies = { ...comment, replies: [] };
      commentMap.set(comment.id, commentWithReplies);

      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        topLevelComments.push(commentWithReplies);
      }
    });

    return topLevelComments.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, []);

  // Handle realtime comment updates
  const handleCommentUpdate = useCallback((pollId: string, updatedComments: Comment[]) => {
    const organizedComments = organizeComments(updatedComments);
    setComments(organizedComments);
    onCommentCountChange?.(updatedComments.length);
  }, [organizeComments, onCommentCountChange]);

  // Use realtime comments hook
  const { comments: flatComments } = useRealtimeComments({
    pollId,
    onCommentUpdate: handleCommentUpdate,
  });

  // Update organized comments when flat comments change
  useEffect(() => {
    const organizedComments = organizeComments(flatComments);
    setComments(organizedComments);
    onCommentCountChange?.(flatComments.length);
    setLoading(false);
  }, [flatComments, organizeComments, onCommentCountChange]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const creatorName = await getCreatorName();

    const { error } = await supabase
      .from('comments')
      .insert({
        poll_id: pollId,
        user_id: user?.id || null,
        guest_id: user ? null : getGuestId(),
        content: newComment.trim(),
        creator_name: creatorName,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      toast({
        title: "Comment posted!",
        description: "Your comment has been added.",
      });
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyText.trim()) return;

    const creatorName = await getCreatorName();

    const { error } = await supabase
      .from('comments')
      .insert({
        poll_id: pollId,
        user_id: user?.id || null,
        guest_id: user ? null : getGuestId(),
        parent_id: parentId,
        content: replyText.trim(),
        creator_name: creatorName,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    } else {
      setReplyingTo(null);
      setReplyText("");
      toast({
        title: "Reply posted!",
        description: "Your reply has been added.",
      });
    }
  };



  const renderComment = (comment: CommentWithReplies, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mb-6'} animate-fade-in`}>
      <div className="flex items-start gap-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
          comment.user_id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {comment.creator_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="bg-secondary/30 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{comment.creator_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 mt-2 ml-4">
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            )}
            <ReportModal
              targetType="comment"
              targetId={comment.id.toString()}
              trigger={
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600 transition-colors">
                  <Flag className="h-3 w-3" />
                  Report
                </button>
              }
            />
          </div>

          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="mt-3 ml-4 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSubmitReply(comment.id)}
                  size="sm"
                  disabled={!replyText.trim()}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Render replies */}
          {comment.replies?.map(reply => renderComment(reply, true))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-16 bg-muted rounded-2xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">Add a comment</span>
        </div>
        <Textarea
          placeholder="Share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="btn-touch"
          >
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}
