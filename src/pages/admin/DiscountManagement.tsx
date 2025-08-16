import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { DiscountCode } from '../../types';
import { supabase } from '../../lib/supabase';

const DiscountManagement: React.FC = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_percentage: '',
    fixed_amount: '',
    max_usage: '',
    is_active: true
  });

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  const fetchDiscountCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscountCodes(data || []);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_percentage: '',
      fixed_amount: '',
      max_usage: '',
      is_active: true
    });
    setEditingCode(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const codeData = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_percentage: formData.discount_type === 'percentage' ? parseFloat(formData.discount_percentage) : 0,
      fixed_amount: parseFloat(formData.fixed_amount) || 0,
      max_usage: formData.max_usage ? parseInt(formData.max_usage) : null,
      is_active: formData.is_active
    };

    try {
      if (editingCode) {
        const { error } = await supabase
          .from('discount_codes')
          .update(codeData)
          .eq('id', editingCode.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('discount_codes')
          .insert(codeData);
        
        if (error) throw error;
      }

      fetchDiscountCodes();
      resetForm();
    } catch (error) {
      console.error('Error saving discount code:', error);
      alert('Error saving discount code');
    }
  };

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      discount_type: code.discount_type,
      discount_percentage: code.discount_percentage.toString(),
      fixed_amount: code.fixed_amount.toString(),
      max_usage: code.max_usage?.toString() || '',
      is_active: code.is_active
    });
    setShowAddForm(true);
  };

  const toggleActive = async (codeId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: !isActive })
        .eq('id', codeId);

      if (error) throw error;
      fetchDiscountCodes();
    } catch (error) {
      console.error('Error toggling discount code:', error);
      alert('Error updating discount code');
    }
  };

  const handleDelete = async (codeId: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;

    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;
      fetchDiscountCodes();
    } catch (error) {
      console.error('Error deleting discount code:', error);
      alert('Error deleting discount code');
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Upravljanje Kodovima za Popust</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Dodaj Kod za Popust</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingCode ? 'Uredi Kod za Popust' : 'Dodaj Novi Kod za Popust'}
            </h3>
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
                Kod za Popust
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="SAVE20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip Popusta
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Procenat (%)</option>
                <option value="fixed">Fiksna suma (RSD)</option>
              </select>
            </div>

            {formData.discount_type === 'percentage' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procenat Popusta (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiksna Suma (RSD)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.fixed_amount}
                  onChange={(e) => setFormData({ ...formData, fixed_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimalan Broj Korišćenja
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_usage}
                onChange={(e) => setFormData({ ...formData, max_usage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Neograničeno"
              />
            </div>

            <div className="flex items-end">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Aktivnosti
              </label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {formData.is_active ? 'Aktivan' : 'Neaktivan'}
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-end space-x-3">
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
                <span>{editingCode ? 'Ažuriraj' : 'Dodaj'} Kod</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discount Codes List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip/Vrednost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Korišćenje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kreiran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discountCodes.map((code) => (
                <tr key={code.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-mono">
                      {code.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {code.discount_type === 'percentage' 
                          ? `${code.discount_percentage}%` 
                          : `${code.fixed_amount} RSD`}
                      </div>
                      <div className="text-gray-500">
                        {code.discount_type === 'percentage' ? 'Procenat' : 'Fiksno'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {code.usage_count || 0}{code.max_usage ? `/${code.max_usage}` : ''}
                      </div>
                      <div className="text-gray-500">
                        {code.max_usage ? 
                          (code.usage_count >= code.max_usage ? 'Iskorišćeno' : 'Ograničeno') : 
                          'Neograničeno'
                        }
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(code.id, code.is_active)}
                      disabled={code.max_usage && code.usage_count >= code.max_usage}
                      className={`flex items-center space-x-2 ${
                        code.max_usage && code.usage_count >= code.max_usage ? 'text-red-400 cursor-not-allowed' :
                        code.is_active ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {code.is_active ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                      <span className="text-sm">
                        {code.max_usage && code.usage_count >= code.max_usage ? 'Iskorišćeno' :
                         code.is_active ? 'Aktivan' : 'Neaktivan'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(code.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(code)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {discountCodes.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nema pronađenih kodova za popust. Kreirajte vaš prvi kod za popust da počnete.
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountManagement;