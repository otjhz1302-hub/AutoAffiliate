import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeaders } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Package, ExternalLink, Star } from 'lucide-react';

const Products = ({ admin, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`, {
        headers: getAuthHeaders()
      });
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
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
      <div data-testid="products-page">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Products</h1>
          <p className="text-white/80">Browse fetched Amazon products</p>
        </div>

        {products.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Package className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600">Products will appear here after the scheduler runs</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl" data-testid="product-item">
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                      }}
                    />
                    {product.price && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/95 text-gray-900 hover:bg-white font-bold text-base px-3 py-1">
                          {product.price}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                      {product.title}
                    </h3>
                    
                    {product.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      {product.rating && (
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium text-gray-900">{product.rating}</span>
                          {product.reviews_count && (
                            <span className="text-xs text-gray-500">({product.reviews_count})</span>
                          )}
                        </div>
                      )}
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>

                    {product.affiliate_url && (
                      <a
                        href={product.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                      >
                        <span>View on Amazon</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      Fetched: {new Date(product.fetched_at).toLocaleDateString()}
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

export default Products;