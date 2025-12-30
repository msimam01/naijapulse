import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

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

  // Fetch all users with auth data
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          is_admin,
          created_at,
          auth.users!inner(email, phone, created_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithAuth: UserWithAuth[] = data.map((profile: any) => ({
        ...profile,
        email: profile.auth.users?.email,
        phone: profile.auth.users?.phone,
        auth_created_at: profile.auth.users?.created_at,
      }));

      setUsers(usersWithAuth);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    }
  };

  // Fetch all polls
  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolls(data);
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError('Failed to load polls');
    }
  };

  // Fetch all reports with content preview
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
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    }
  };

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
      fetchReports(),
      fetchStats(),
    ]);

    setLoading(false);
  };

  // Refresh specific data
  const refreshUsers = () => fetchUsers();
  const refreshPolls = () => fetchPolls();
  const refreshReports = () => fetchReports();
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
