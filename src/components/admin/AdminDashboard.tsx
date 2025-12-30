import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BarChart3,
  Vote,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { AdminStats } from '@/hooks/useAdminData';

interface AdminDashboardProps {
  stats: AdminStats;
  loading?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Registered users',
    },
    {
      title: 'Total Polls',
      value: stats.totalPolls.toLocaleString(),
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Active polls',
    },
    {
      title: 'Total Votes',
      value: stats.totalVotes.toLocaleString(),
      icon: Vote,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Votes cast',
    },
    {
      title: 'Total Reports',
      value: stats.totalReports.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Pending reports',
    },
    {
      title: 'Revenue Potential',
      value: `$${stats.revenuePotential.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'From sponsored polls',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">User Engagement</span>
              <Badge variant={stats.totalVotes > 0 ? "default" : "secondary"}>
                {stats.totalPolls > 0 ? Math.round((stats.totalVotes / stats.totalPolls) * 100) / 100 : 0} votes/poll
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Report Rate</span>
              <Badge variant={stats.totalReports > 10 ? "destructive" : "secondary"}>
                {stats.totalPolls > 0 ? ((stats.totalReports / stats.totalPolls) * 100).toFixed(1) : 0}% of polls reported
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sponsored Content</span>
              <Badge variant="outline">
                Revenue potential: ${stats.revenuePotential}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Use the tabs above to manage users, polls, and reports. All changes are reflected in real-time.
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted p-3 rounded">
                <div className="font-medium">Users</div>
                <div className="text-muted-foreground">Add, edit roles, delete</div>
              </div>
              <div className="bg-muted p-3 rounded">
                <div className="font-medium">Polls</div>
                <div className="text-muted-foreground">Toggle sponsored, delete</div>
              </div>
              <div className="bg-muted p-3 rounded">
                <div className="font-medium">Reports</div>
                <div className="text-muted-foreground">Review, delete content</div>
              </div>
              <div className="bg-muted p-3 rounded">
                <div className="font-medium">Dashboard</div>
                <div className="text-muted-foreground">Monitor platform metrics</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
