import React, { useState, useEffect } from 'react';
import { Package, Edit2, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';

const FakeDiscountManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    original_price: '',
    show_fake_discount: false
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
      original_price: '',
      show_fake_discount: false
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      original_price: product.original_price?.toString() || '',
      show_fake_discount: product.show_fake_discount || false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;

    const updateData = {
      original_price: parseFloat(formData.original_price) || 0,
      show_fake_discount: formData.show_fake_discount
    };

    try {
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', editingProduct.id);
      
      if (error) throw error;

      fetchProducts();
      resetForm();
      alert('Lažni popust je uspešno ažuriran!');
    } catch (error) {
      console.error('Greška pri čuvanju:', error);
      alert('Greška pri čuvanju lažnog popusta');
    }
  };

  const toggleFakeDiscount = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ show_fake_discount: !currentStatus })
        .eq('id', productId);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Greška pri menjanju statusa:', error);
      alert('Greška pri menjanju statusa lažnog popusta');
    }
  };

  const calculateDiscountPercentage = (originalPrice: number, currentPrice: number) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
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
          <h2 className="text-2xl font-bold text-gray-900">Upravljanje Lažnim Popustom</h2>
          <p className="text-gray-600 mt-1">
            Postavite lažnu originalnu cenu da pokažete "popust" koji privlači kupce
          </p>
        </div>
      </div>

      {/* Edit Form */}
      {editingProduct && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Uredi Lažni Popust - {editingProduct.name}
              </h3>
              <p className="text-gray-600">Trenutna cena: {editingProduct.price.toFixed(0)} RSD</p>
            </div>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lažna Originalna Cena (RSD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="npr. 1500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Ova cena će biti prikazana kao precrtana "stara" cena
              </p>
            </div>

            <div className="flex items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prikaži Lažni Popust
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.show_fake_discount}
                    onChange={(e) => setFormData({ ...formData, show_fake_discount: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {formData.show_fake_discount ? 'Aktivno' : 'Neaktivno'}
                  </span>
                </div>
              </div>
            </div>

            {formData.original_price && parseFloat(formData.original_price) > editingProduct.price && (
              <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Pregled Lažnog Popusta:</h4>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500 line-through">
                    {parseFloat(formData.original_price).toFixed(0)} RSD
                  </span>
                  <span className="text-xl font-bold text-red-600">
                    {editingProduct.price.toFixed(0)} RSD
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    -{calculateDiscountPercentage(parseFloat(formData.original_price), editingProduct.price)}%
                  </span>
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex justify-end space-x-3">
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
                <span>Sačuvaj Lažni Popust</span>
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
                  Trenutna Cena
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lažna Originalna Cena
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lažni Popust
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.price.toFixed(0)} RSD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.original_price ? `${product.original_price.toFixed(0)} RSD` : 'Nije postavljena'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.original_price && product.original_price > product.price ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                        -{calculateDiscountPercentage(product.original_price, product.price)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">Nema popusta</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleFakeDiscount(product.id, product.show_fake_discount || false)}
                      className={`flex items-center space-x-2 ${
                        product.show_fake_discount ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {product.show_fake_discount ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                      <span className="text-sm">
                        {product.show_fake_discount ? 'Aktivno' : 'Neaktivno'}
                      </span>
                    </button>
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
              ))}
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

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-yellow-900 mb-2">⚠️ Napomena o Lažnom Popustu</h3>
        <p className="text-yellow-800">
          Ova funkcionalnost vam omogućava da prikažete "popust" koji u stvari ne postoji. 
          Koristite odgovorno i u skladu sa zakonima o zaštiti potrošača u vašoj zemlji.
        </p>
      </div>
    </div>
  );
};

export default FakeDiscountManagement;