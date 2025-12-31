import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useRealtimeReports } from './useRealtimeReports';

type Profile = Tables<'profiles'>;
type Poll = Tables<'polls'>;
type Report = Tables<'reports'>;

export interface UserWithAuth extends Profile {
  email?: string;
  phone?: string;
  auth_created_at?: string;
}

export interface ReportWithContent extends Report {
  poll_title?: string;
  poll_question?: string;
  comment_content?: string;
  creator_name?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPolls: number;
  totalVotes: number;
  totalReports: number;
  revenuePotential: number;
}

export const useAdminData = () => {
  const [users, setUsers] = useState<UserWithAuth[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [reports, setReports] = useState<ReportWithContent[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPolls: 0,
    totalVotes: 0,
    totalReports: 0,
    revenuePotential: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users (profiles only - auth data requires special permissions)
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert profiles to UserWithAuth format (without auth data for now)
      const usersWithAuth: UserWithAuth[] = data.map((profile) => ({
        ...profile,
        email: undefined, // Auth data requires admin API access
        phone: undefined,
        auth_created_at: undefined,
      }));

      setUsers(usersWithAuth);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    }
  };

  // Fetch all polls with accurate vote/comment counts
  const fetchPolls = async () => {
    try {
      // First get all polls
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      // Then get accurate counts for each poll
      const pollsWithCounts = await Promise.all(
        (pollsData || []).map(async (poll) => {
          const [
            { count: voteCount },
            { count: commentCount }
          ] = await Promise.all([
            supabase.from('votes').select('*', { count: 'exact', head: true }).eq('poll_id', poll.id),
            supabase.from('comments').select('*', { count: 'exact', head: true }).eq('poll_id', poll.id)
          ]);

          return {
            ...poll,
            vote_count: voteCount || 0,
            comment_count: commentCount || 0,
            createdBy: poll.creator_name, // Map creator_name to createdBy
          };
        })
      );

      setPolls(pollsWithCounts);
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError('Failed to load polls');
    }
  };

  // Enrich report with content preview
  const enrichReport = async (report: Report): Promise<ReportWithContent> => {
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
  };

  // Handle realtime report updates
  const handleReportUpdate = async (updatedReports: Report[]) => {
    const enrichedReports = await Promise.all(
      updatedReports.map(enrichReport)
    );
    setReports(enrichedReports);
  };

  // Use realtime reports hook
  const { reports: realtimeReports, refetch: refetchReports } = useRealtimeReports({
    onReportUpdate: handleReportUpdate,
  });

  // Fetch admin stats
  const fetchStats = async () => {
    try {
      const [
        { count: totalUsers },
        { count: totalPolls },
        { data: votesData },
        { count: totalReports },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('polls').select('*', { count: 'exact', head: true }),
        supabase.from('votes').select('id'),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
      ]);

      const totalVotes = votesData?.length || 0;
      const sponsoredPolls = polls.filter(p => p.is_sponsored).length;
      const revenuePotential = sponsoredPolls * 1000; // Assuming $1000 per sponsored poll

      setStats({
        totalUsers: totalUsers || 0,
        totalPolls: totalPolls || 0,
        totalVotes,
        totalReports: totalReports || 0,
        revenuePotential,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    await Promise.all([
      fetchUsers(),
      fetchPolls(),
      fetchStats(),
    ]);

    // Reports are handled by realtime hook
    setLoading(false);
  };

  // Refresh specific data
  const refreshUsers = () => fetchUsers();
  const refreshPolls = () => fetchPolls();
  const refreshReports = () => refetchReports();
  const refreshStats = () => fetchStats();

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    users,
    polls,
    reports,
    stats,
    loading,
    error,
    refreshUsers,
    refreshPolls,
    refreshReports,
    refreshStats,
    fetchAllData,
  };
};
