import { useState, useEffect } from "react";
import { Shield, Users, BarChart3, AlertTriangle, Loader2, BarChart4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAdminData } from "@/hooks/useAdminData";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminPolls } from "@/components/admin/AdminPolls";
import { AdminReports } from "@/components/admin/AdminReports";

type TabType = "dashboard" | "users" | "polls" | "reports";

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  const {
    users,
    polls,
    reports,
    stats,
    loading: dataLoading,
    refreshUsers,
    refreshPolls,
    refreshReports,
    refreshStats,
  } = useAdminData();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setAdminCheckLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setAdminCheckLoading(false);
          window.location.href = '/';
          return;
        }

        const admin = profile?.is_admin || false;
        setIsAdmin(admin);

        if (!admin) {
          setAdminCheckLoading(false);
          window.location.href = '/';
          return;
        }

        setAdminCheckLoading(false);
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
        setAdminCheckLoading(false);
        window.location.href = '/';
        return;
      }
    };

    checkAdmin();
  }, [user]);

  // Show loading or redirect for non-admin
  if (adminCheckLoading) {
    return (
      <div className="container py-6 sm:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  const sidebarItems = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: BarChart4 },
    { id: "users" as TabType, label: "Users", icon: Users },
    { id: "polls" as TabType, label: "Polls", icon: BarChart3 },
    { id: "reports" as TabType, label: "Reports", icon: AlertTriangle },
  ];

  const handleRefresh = () => {
    refreshUsers();
    refreshPolls();
    refreshReports();
    refreshStats();
  };

  return (
    <div className="container py-6 sm:py-10">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Tabs */}
          <div className="flex md:hidden gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className="shrink-0 gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-up">
            <div>
              <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-foreground">
                {activeTab === "dashboard"
                  ? "Admin Dashboard"
                  : activeTab === "users"
                  ? "Users Management"
                  : activeTab === "polls"
                  ? "Polls Management"
                  : "Reports Management"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {activeTab === "dashboard"
                  ? "Overview of platform statistics and health"
                  : activeTab === "users"
                  ? "Manage user accounts and permissions"
                  : activeTab === "polls"
                  ? "Review and manage polls"
                  : "Review and moderate reported content"}
              </p>
            </div>
            {activeTab !== "dashboard" && (
              <Button variant="outline" onClick={handleRefresh} disabled={dataLoading}>
                {dataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
            )}
          </div>

          {/* Content based on active tab */}
          {activeTab === "dashboard" && (
            <AdminDashboard stats={stats} loading={dataLoading} />
          )}

          {activeTab === "users" && (
            <AdminUsers
              users={users}
              loading={dataLoading}
              onRefresh={refreshUsers}
            />
          )}

          {activeTab === "polls" && (
            <AdminPolls
              polls={polls}
              loading={dataLoading}
              onRefresh={refreshPolls}
            />
          )}

          {activeTab === "reports" && (
            <AdminReports
              reports={reports}
              loading={dataLoading}
              onRefresh={refreshReports}
            />
          )}
        </div>
      </div>
    </div>
  );
}
