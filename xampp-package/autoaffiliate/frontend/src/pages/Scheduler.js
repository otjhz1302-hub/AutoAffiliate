import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeaders } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Calendar, Play, Pause, Clock } from 'lucide-react';

const Scheduler = ({ admin, onLogout }) => {
  const [config, setConfig] = useState({
    is_active: false,
    posts_per_day: 3,
    post_times: ['09:00', '14:00', '19:00'],
    platforms: ['instagram']
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API}/scheduler`, {
        headers: getAuthHeaders()
      });
      setConfig(response.data);
    } catch (error) {
      toast.error('Failed to load scheduler config');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/scheduler`, config, {
        headers: getAuthHeaders()
      });
      toast.success('Scheduler settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await axios.post(`${API}/scheduler/run-now`, {}, {
        headers: getAuthHeaders()
      });
      toast.success('Job started! Products will be fetched and posted shortly.');
    } catch (error) {
      toast.error('Failed to start job');
    } finally {
      setRunning(false);
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
      <div data-testid="scheduler-page">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Scheduler</h1>
          <p className="text-white/80">Configure automated posting schedule</p>
        </div>

        <div className="space-y-6">
          {/* Scheduler Status */}
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.is_active ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                    {config.is_active ? <Play className="w-6 h-6 text-white" /> : <Pause className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <CardTitle>Automation Status</CardTitle>
                    <CardDescription>{config.is_active ? 'Scheduler is running' : 'Scheduler is stopped'}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Enable Automation</span>
                  <Switch
                    data-testid="scheduler-toggle"
                    checked={config.is_active}
                    onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Scheduler Configuration */}
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Posting Schedule</CardTitle>
                  <CardDescription>Configure how often products are posted</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="posts_per_day">Posts Per Day</Label>
                <Input
                  id="posts_per_day"
                  data-testid="posts-per-day-input"
                  type="number"
                  min="1"
                  max="10"
                  value={config.posts_per_day}
                  onChange={(e) => setConfig({ ...config, posts_per_day: parseInt(e.target.value) || 1 })}
                  className="mt-1 max-w-xs"
                />
                <p className="text-xs text-gray-500 mt-1">Number of products to post daily (1-10)</p>
              </div>

              <div>
                <Label>Automation Frequency</Label>
                <div className="mt-2 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium">Runs every 4 hours automatically</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    The scheduler will fetch trending products and post them to your configured platforms every 4 hours when enabled.
                  </p>
                </div>
              </div>

              <div>
                <Label>Active Platforms</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="instagram"
                      checked={config.platforms.includes('instagram')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig({ ...config, platforms: [...config.platforms, 'instagram'] });
                        } else {
                          setConfig({ ...config, platforms: config.platforms.filter(p => p !== 'instagram') });
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="instagram" className="text-sm font-medium text-gray-700">Instagram</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="facebook"
                      checked={config.platforms.includes('facebook')}
                      disabled
                      className="w-4 h-4 text-gray-400 rounded"
                    />
                    <label htmlFor="facebook" className="text-sm font-medium text-gray-400">Facebook (Coming Soon)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pinterest"
                      checked={config.platforms.includes('pinterest')}
                      disabled
                      className="w-4 h-4 text-gray-400 rounded"
                    />
                    <label htmlFor="pinterest" className="text-sm font-medium text-gray-400">Pinterest (Coming Soon)</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Trigger */}
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>Manual Trigger</CardTitle>
              <CardDescription>Run the job immediately without waiting for the schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRunNow}
                data-testid="run-now-button"
                disabled={running}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {running ? 'Running...' : 'Run Now'}
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              data-testid="save-scheduler-button"
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Scheduler;