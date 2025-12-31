import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Report = Tables<'reports'>;

interface UseRealtimeReportsOptions {
  onReportUpdate?: (reports: Report[]) => void;
}

export const useRealtimeReports = ({ onReportUpdate }: UseRealtimeReportsOptions = {}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch initial reports
  const fetchReports = useCallback(async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return;
    }

    setReports(data || []);
  }, []);

  // Handle report insert
  const handleReportInsert = useCallback((payload: any) => {
    const newReport = payload.new as Report;

    setReports(prev => {
      // Check if report already exists
      const exists = prev.find(r => r.id === newReport.id);
      if (exists) return prev;

      const updated = [newReport, ...prev].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      onReportUpdate?.(updated);
      return updated;
    });
  }, [onReportUpdate]);

  // Handle report update (e.g., status changes)
  const handleReportUpdate = useCallback((payload: any) => {
    const updatedReport = payload.new as Report;

    setReports(prev => {
      const updated = prev.map(r =>
        r.id === updatedReport.id ? updatedReport : r
      );
      onReportUpdate?.(updated);
      return updated;
    });
  }, [onReportUpdate]);

  // Handle report delete
  const handleReportDelete = useCallback((payload: any) => {
    const deletedReport = payload.old as Report;

    setReports(prev => {
      const updated = prev.filter(r => r.id !== deletedReport.id);
      onReportUpdate?.(updated);
      return updated;
    });
  }, [onReportUpdate]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (isSubscribed) return;

    const channel = supabase.channel('reports:admin');

    // Subscribe to inserts
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'reports',
    }, handleReportInsert);

    // Subscribe to updates
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'reports',
    }, handleReportUpdate);

    // Subscribe to deletes
    channel.on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'reports',
    }, handleReportDelete);

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsSubscribed(true);
      }
    });

    // Fetch initial data
    fetchReports();

    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [handleReportInsert, handleReportUpdate, handleReportDelete, fetchReports, isSubscribed]);

  return { reports, refetch: fetchReports };
};
