import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeaders } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Key, ShoppingCart, Instagram, Facebook, PinIcon, BarChart } from 'lucide-react';

const Integrations = ({ admin, onLogout }) => {
  const [config, setConfig] = useState({
    rapidapi_key: '',
    rapidapi_host: 'amazon23.p.rapidapi.com',
    amazon_affiliate_tag: '',
    instagram_access_token: '',
    instagram_user_id: '',
    facebook_access_token: '',
    facebook_page_id: '',
    pinterest_access_token: '',
    google_analytics_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API}/integrations`, {
        headers: getAuthHeaders()
      });
      setConfig(response.data);
    } catch (error) {
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/integrations`, config, {
        headers: getAuthHeaders()
      });
      toast.success('Integration settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
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
      <div data-testid="integrations-page">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Integrations</h1>
          <p className="text-white/80">Configure your API keys and credentials</p>
        </div>

        <div className="space-y-6">
          {/* Amazon & RapidAPI */}
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Amazon Product Source</CardTitle>
                  <CardDescription>RapidAPI configuration for fetching Amazon products</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rapidapi_key">RapidAPI Key *</Label>
                <Input
                  id="rapidapi_key"
                  data-testid="rapidapi-key-input"
                  type="text"
                  placeholder="Enter your RapidAPI key"
                  value={config.rapidapi_key || ''}
                  onChange={(e) => setConfig({ ...config, rapidapi_key: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Get your key from <a href="https://rapidapi.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">RapidAPI.com</a></p>
              </div>
              <div>
                <Label htmlFor="rapidapi_host">RapidAPI Host</Label>
                <Input
                  id="rapidapi_host"
                  type="text"
                  value={config.rapidapi_host || ''}
                  onChange={(e) => setConfig({ ...config, rapidapi_host: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="amazon_affiliate_tag">Amazon Affiliate Tag</Label>
                <Input
                  id="amazon_affiliate_tag"
                  data-testid="amazon-tag-input"
                  type="text"
                  placeholder="your-affiliate-tag-20"
                  value={config.amazon_affiliate_tag || ''}
                  onChange={(e) => setConfig({ ...config, amazon_affiliate_tag: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Your Amazon Associates tracking ID</p>
              </div>
            </CardContent>
          </Card>

          {/* Instagram */}
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Instagram Integration</CardTitle>
                  <CardDescription>Meta Graph API credentials for Instagram posting</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instagram_access_token">Access Token *</Label>
                <Input
                  id="instagram_access_token"
                  data-testid="instagram-token-input"
                  type="password"
                  placeholder="Enter Instagram access token"
                  value={config.instagram_access_token || ''}
                  onChange={(e) => setConfig({ ...config, instagram_access_token: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Get from <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Facebook Developers</a></p>
              </div>
              <div>
                <Label htmlFor="instagram_user_id">Instagram User ID *</Label>
                <Input
                  id="instagram_user_id"
                  data-testid="instagram-userid-input"
                  type="text"
                  placeholder="Your Instagram Business Account ID"
                  value={config.instagram_user_id || ''}
                  onChange={(e) => setConfig({ ...config, instagram_user_id: e.target.value })}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Facebook */}
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Facebook className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Facebook Integration (Coming Soon)</CardTitle>
                  <CardDescription>Facebook Page posting credentials</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebook_access_token">Access Token</Label>
                <Input
                  id="facebook_access_token"
                  type="password"
                  placeholder="Enter Facebook access token"
                  value={config.facebook_access_token || ''}
                  onChange={(e) => setConfig({ ...config, facebook_access_token: e.target.value })}
                  className="mt-1"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="facebook_page_id">Page ID</Label>
                <Input
                  id="facebook_page_id"
                  type="text"
                  placeholder="Your Facebook Page ID"
                  value={config.facebook_page_id || ''}
                  onChange={(e) => setConfig({ ...config, facebook_page_id: e.target.value })}
                  className="mt-1"
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Pinterest */}
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <PinIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Pinterest Integration (Coming Soon)</CardTitle>
                  <CardDescription>Pinterest API credentials</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pinterest_access_token">Access Token</Label>
                <Input
                  id="pinterest_access_token"
                  type="password"
                  placeholder="Enter Pinterest access token"
                  value={config.pinterest_access_token || ''}
                  onChange={(e) => setConfig({ ...config, pinterest_access_token: e.target.value })}
                  className="mt-1"
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Google Analytics */}
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <BarChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Google Analytics</CardTitle>
                  <CardDescription>Track your affiliate link performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="google_analytics_id">Measurement ID</Label>
                <Input
                  id="google_analytics_id"
                  data-testid="ga-id-input"
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={config.google_analytics_id || ''}
                  onChange={(e) => setConfig({ ...config, google_analytics_id: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Your Google Analytics 4 Measurement ID</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              data-testid="save-integrations-button"
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl"
            >
              {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Integrations;