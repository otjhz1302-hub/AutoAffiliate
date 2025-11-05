import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeaders } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

const Analytics = ({ admin, onLogout }) => {
  const [chartData, setChartData] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [chartResponse, overviewResponse] = await Promise.all([
        axios.get(`${API}/analytics/chart?days=7`, { headers: getAuthHeaders() }),
        axios.get(`${API}/analytics/overview`, { headers: getAuthHeaders() })
      ]);
      
      setChartData(chartResponse.data);
      setOverview(overviewResponse.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout admin={admin} onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout admin={admin} onLogout={onLogout}>
      <div data-testid="analytics-page">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-white/80">Track your performance and engagement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Total Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Posts</span>
                  <span className="font-bold text-2xl text-gray-900">{overview?.total_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-xl text-green-600">
                    {overview?.total_posts > 0
                      ? Math.round((overview.successful_posts / overview.total_posts) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Products</span>
                  <span className="font-bold text-xl text-gray-900">{overview?.total_products || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Post Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-green-600 font-medium">Successful</span>
                  <span className="font-bold text-xl text-gray-900">{overview?.successful_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-red-600 font-medium">Failed</span>
                  <span className="font-bold text-xl text-gray-900">{overview?.failed_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-600 font-medium">Pending</span>
                  <span className="font-bold text-xl text-gray-900">{overview?.pending_posts || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Posts Over Time (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total_posts"
                      stroke="#6366f1"
                      strokeWidth={2}
                      name="Total Posts"
                    />
                    <Line
                      type="monotone"
                      dataKey="successful_posts"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Successful"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="instagram_posts" fill="#ec4899" name="Instagram" />
                    <Bar dataKey="facebook_posts" fill="#3b82f6" name="Facebook" />
                    <Bar dataKey="pinterest_posts" fill="#ef4444" name="Pinterest" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {chartData.length === 0 && (
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No analytics data yet</h3>
              <p className="text-gray-600">Data will appear here after posts are created</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 p-4 bg-white/80 backdrop-blur-xl rounded-lg border border-white/20">
          <p className="text-sm text-gray-600">
            <strong>Google Analytics Integration:</strong> Add your Google Analytics Measurement ID in the Integrations page to track clicks and conversions from your affiliate links.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;