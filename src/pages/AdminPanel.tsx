import { useState, useEffect } from "react";
import { Shield, Users, BarChart3, AlertTriangle, Loader2, BarChart4, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAdminData } from "@/hooks/useAdminData";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminPolls } from "@/components/admin/AdminPolls";
import { AdminReports } from "@/components/admin/AdminReports";

type TabType = "dashboard" | "users" | "polls" | "reports" | "settings";

export default function AdminPanel() {
  const { user } = useAuth();
  const { t, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [updating, setUpdating] = useState(false);

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

  // Load display name when settings tab is active
  useEffect(() => {
    if (activeTab === "settings" && user) {
      const loadDisplayName = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          setDisplayName(profile.display_name || "");
        }
      };
      loadDisplayName();
    }
  }, [activeTab, user]);

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
          setIsAdmin(false);
          setAdminCheckLoading(false);
          window.location.href = '/';
          return;
        }

        const admin = profile?.is_admin || false;

        if (!admin) {
          setIsAdmin(false);
          setAdminCheckLoading(false);
          window.location.href = '/';
          return;
        }

        setIsAdmin(true);
        setAdminCheckLoading(false);
      } catch (error) {
        setIsAdmin(false);
        setAdminCheckLoading(false);
        window.location.href = '/';
        return;
      }
    };

    checkAdmin();
  }, [user]);

  // Handle settings update
  const handleUpdateSettings = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your display name has been updated.',
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRefresh = () => {
    refreshUsers();
    refreshPolls();
    refreshReports();
    refreshStats();
  };

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
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ];

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
                  : activeTab === "reports"
                  ? "Reports Management"
                  : "Account Settings"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {activeTab === "dashboard"
                  ? "Overview of platform statistics and health"
                  : activeTab === "users"
                  ? "Manage user accounts and permissions"
                  : activeTab === "polls"
                  ? "Review and manage polls"
                  : activeTab === "reports"
                  ? "Review and moderate reported content"
                  : "Manage your account settings"}
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

          {activeTab === "settings" && (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-up delay-100">
              <h2 className="font-poppins font-semibold text-lg text-foreground mb-6">
                Account Settings
              </h2>

              <div className="space-y-6">
                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="adminDisplayName">Display Name</Label>
                  <Input
                    id="adminDisplayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>

                {/* Language Preference */}
                <div className="space-y-2">
                  <Label>Language Preference</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={t("language") === "en" ? "default" : "outline"}
                      onClick={() => setLanguage("en")}
                      size="sm"
                    >
                      English
                    </Button>
                    <Button
                      variant={t("language") === "pidgin" ? "default" : "outline"}
                      onClick={() => setLanguage("pidgin")}
                      size="sm"
                    >
                      Pidgin
                    </Button>
                  </div>
                </div>

                {/* Save Button */}
                <Button onClick={handleUpdateSettings} disabled={updating} className="w-full sm:w-auto">
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
