import React, { useState, useEffect } from 'react';
import { Package, Edit2, Save, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';

const StockManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    stock_quantity: '',
    track_stock: false,
    low_stock_threshold: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Greška pri učitavanju proizvoda:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      stock_quantity: '',
      track_stock: false,
      low_stock_threshold: ''
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      stock_quantity: product.stock_quantity?.toString() || '0',
      track_stock: product.track_stock || false,
      low_stock_threshold: product.low_stock_threshold?.toString() || '5'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;

    const updateData = {
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      track_stock: formData.track_stock,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 5
    };

    try {
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', editingProduct.id);
      
      if (error) throw error;

      fetchProducts();
      resetForm();
      alert('Stock je uspešno ažuriran!');
    } catch (error) {
      console.error('Greška pri čuvanju:', error);
      alert('Greška pri čuvanju stock-a');
    }
  };

  const quickUpdateStock = async (productId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', productId);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Greška pri ažuriranju stock-a:', error);
      alert('Greška pri ažuriranju stock-a');
    }
  };

  const getStockStatus = (product: Product) => {
    if (!product.track_stock) return { status: 'not-tracked', color: 'text-gray-500', text: 'Ne prati se' };
    if (product.stock_quantity <= 0) return { status: 'out', color: 'text-red-600', text: 'Nema na stanju' };
    if (product.stock_quantity <= product.low_stock_threshold) return { status: 'low', color: 'text-orange-600', text: 'Malo stanje' };
    return { status: 'good', color: 'text-green-600', text: 'Na stanju' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Upravljanje</h2>
          <p className="text-gray-600 mt-1">
            Upravljajte zalihama proizvoda i pratite stanje na stanju
          </p>
        </div>
      </div>

      {/* Edit Form */}
      {editingProduct && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Uredi Stock - {editingProduct.name}
              </h3>
              <p className="text-gray-600">Trenutno stanje: {editingProduct.stock_quantity}</p>
            </div>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Količina na Stanju
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prag za Upozorenje
              </label>
              <input
                type="number"
                min="0"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upozorenje kada je stanje ispod ove vrednosti
              </p>
            </div>

            <div className="flex items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prati Stock
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.track_stock}
                    onChange={(e) => setFormData({ ...formData, track_stock: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {formData.track_stock ? 'Aktivno' : 'Neaktivno'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Otkaži
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Sačuvaj Stock</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proizvod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trenutno Stanje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prag Upozorenja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brza Akcija
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        {product.track_stock ? product.stock_quantity : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center space-x-2 ${stockStatus.color}`}>
                        {stockStatus.status === 'out' && <AlertTriangle className="w-4 h-4" />}
                        {stockStatus.status === 'low' && <AlertTriangle className="w-4 h-4" />}
                        {stockStatus.status === 'good' && <CheckCircle className="w-4 h-4" />}
                        <span className="text-sm font-medium">{stockStatus.text}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.track_stock ? product.low_stock_threshold : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.track_stock && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => quickUpdateStock(product.id, product.stock_quantity + 10)}
                            className="bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-medium"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => quickUpdateStock(product.id, Math.max(0, product.stock_quantity - 10))}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-medium"
                          >
                            -10
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Uredi</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nema pronađenih proizvoda.</p>
          </div>
        )}
      </div>

      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Na Stanju</p>
              <p className="text-lg font-bold text-gray-900">
                {products.filter(p => p.track_stock && p.stock_quantity > p.low_stock_threshold).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Malo Stanje</p>
              <p className="text-lg font-bold text-gray-900">
                {products.filter(p => p.track_stock && p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Nema na Stanju</p>
              <p className="text-lg font-bold text-gray-900">
                {products.filter(p => p.track_stock && p.stock_quantity <= 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Ukupno Proizvoda</p>
              <p className="text-lg font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;