import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeaders } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Instagram, Facebook, PinIcon, FileText } from 'lucide-react';

const Posts = ({ admin, onLogout }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts`, {
        headers: getAuthHeaders()
      });
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'pinterest':
        return <PinIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'posted':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Posted</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
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
      <div data-testid="posts-page">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Posts</h1>
          <p className="text-white/80">View all posted and scheduled content</p>
        </div>

        {posts.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Enable the scheduler to start posting automatically</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl" data-testid="post-item">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={post.product_image}
                      alt={post.product_title}
                      className="w-24 h-24 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                          {post.product_title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-4">
                          {getStatusBadge(post.status)}
                          <Badge variant="outline" className="flex items-center space-x-1">
                            {getPlatformIcon(post.platform)}
                            <span className="capitalize">{post.platform}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {post.caption}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          Scheduled: {new Date(post.scheduled_at).toLocaleString()}
                        </span>
                        {post.posted_at && (
                          <span>
                            Posted: {new Date(post.posted_at).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {post.error_message && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          Error: {post.error_message}
                        </div>
                      )}

                      {post.platform_post_id && (
                        <div className="mt-2 text-xs text-gray-500">
                          Post ID: {post.platform_post_id}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Posts;