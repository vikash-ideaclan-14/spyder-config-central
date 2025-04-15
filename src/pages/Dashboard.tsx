import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Settings, FileText, Layers, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adApi, batchApi, configApi } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Dashboard: React.FC = () => {
  const { data: configs } = useQuery({
    queryKey: ['configs'],
    queryFn: () => configApi.getConfigs(1, 20, 'createdAt', 'desc'),
  });

  const { data: ads } = useQuery({
    queryKey: ['ads'],
    queryFn: () => adApi.getAds(1, 20, 'createdAt', 'desc'),
  });

  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: batchApi.getBatches,
  });

  // Prepare ad stats
  const adStats = ads ? [
  ] : [];

  // Prepare batch stats
  const batchData = batches ? [
    { name: 'Active', value: batches.filter(batch => batch.status === 'active').length },
    { name: 'Completed', value: batches.filter(batch => batch.status === 'completed').length },
    { name: 'Upcoming', value: batches.filter(batch => batch.status === 'upcoming').length },
  ] : [];

  // For clicks/impressions chart
  const adClicksData = ads ? ads.items.slice(0, 5).map(ad => ({
    name: ad.title.substring(0, 10) + (ad.title.length > 10 ? '...' : ''),
  })) : [];

  const COLORS = ['#00B0B9', '#7954A1', '#FF8042', '#FFBB28'];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-full overflow-x-hidden">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium">Total Configurations</CardTitle>
                <CardDescription>All system configurations</CardDescription>
              </div>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{configs?.spyderConfigs.items.length || 0}</div>
              <Link to="/configs" className="text-sm text-spyder-teal flex items-center mt-2 hover:underline">
                View Configurations <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium">Advertisements</CardTitle>
                <CardDescription>Active and pending ads</CardDescription>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ads?.items.length || 0}</div>
              <Link to="/ads" className="text-sm text-spyder-teal flex items-center mt-2 hover:underline">
                Manage Advertisements <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium">Spyder Batches</CardTitle>
                <CardDescription>Processing batches</CardDescription>
              </div>
              <Layers className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{batches?.length || 0}</div>
              <Link to="/batches" className="text-sm text-spyder-teal flex items-center mt-2 hover:underline">
                Manage Batches <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ad Clicks/Impressions Chart */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Ad Performance</CardTitle>
              <CardDescription>Clicks and impressions for top ads</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={adClicksData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="impressions" fill="#1A2C42" name="Impressions" />
                  <Bar dataKey="clicks" fill="#00B0B9" name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ad Status Pie Chart */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Ad Status Distribution</CardTitle>
              <CardDescription>Distribution of ads by status</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={adStats}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {adStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Current system status and health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Configurations</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Recent Updates:</span>
                    <span className="font-medium">{configs?.spyderConfigs.items.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending Changes:</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Health Status:</span>
                    <span className="text-green-500 font-medium">Good</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Advertisements</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active:</span>
                    <span className="font-medium">
                      {ads?.items.filter(ad => ad.status === 'active').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Clicks:</span>
                    <span className="font-medium">
                      {/* {ads?.items.reduce((sum, ad) => sum + (ad.clicks || 0), 0) || 0} */}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    {/* <span>Conversion Rate:</span> */}
                    {/* <span className="font-medium"> */}
                      {/* {ads?.items.length
                        ? (
                            // (ads.items.reduce((sum, ad) => sum + (ad.clicks || 0), 0) /
                              ads.items.reduce((sum, ad) => sum + (ad.impressions || 0), 0)) *
                            100
                          ).toFixed(2) + '%'
                        : '0%'} */}
                    {/* </span> */}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Batches</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Batches:</span>
                    <span className="font-medium">
                      {batches?.filter(batch => batch.status === 'active').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed:</span>
                    <span className="font-medium">
                      {batches?.filter(batch => batch.status === 'completed').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Load:</span>
                    <span className="text-yellow-500 font-medium">Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
