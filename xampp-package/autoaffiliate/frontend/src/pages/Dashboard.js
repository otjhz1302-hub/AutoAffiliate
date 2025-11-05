import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeaders } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { TrendingUp, Package, CheckCircle, XCircle, Clock, Instagram, Facebook } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = ({ admin, onLogout }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/overview`, {
        headers: getAuthHeaders()
      });
      setAnalytics(response.data);
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

  const stats = [
    {
      title: 'Total Posts',
      value: analytics?.total_posts || 0,
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Products',
      value: analytics?.total_products || 0,
      icon: Package,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Successful',
      value: analytics?.successful_posts || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Failed',
      value: analytics?.failed_posts || 0,
      icon: XCircle,
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'Pending',
      value: analytics?.pending_posts || 0,
      icon: Clock,
      color: 'from-yellow-500 to-amber-500'
    },
    {
      title: 'Instagram Posts',
      value: analytics?.instagram_posts || 0,
      icon: Instagram,
      color: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <Layout admin={admin} onLogout={onLogout}>
      <div data-testid="dashboard-page">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/80">Welcome back, {admin?.username}! Here's your overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-green-600">
                    {analytics?.total_posts > 0
                      ? Math.round((analytics.successful_posts / analytics.total_posts) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Instagram Posts</span>
                  <span className="font-bold text-gray-900">{analytics?.instagram_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Facebook Posts</span>
                  <span className="font-bold text-gray-900">{analytics?.facebook_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pinterest Posts</span>
                  <span className="font-bold text-gray-900">{analytics?.pinterest_posts || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-900">Today's Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Posts Today</span>
                  <span className="font-bold text-gray-900">{analytics?.today?.total_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Instagram</span>
                  <span className="font-bold text-gray-900">{analytics?.today?.instagram_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Successful</span>
                  <span className="font-bold text-green-600">{analytics?.today?.successful_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Failed</span>
                  <span className="font-bold text-red-600">{analytics?.today?.failed_posts || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;