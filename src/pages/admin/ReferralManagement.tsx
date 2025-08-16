import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ToggleLeft, ToggleRight, Users, DollarSign, Clock, CheckCircle, XCircle, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ReferralUser {
  id: string;
  username: string;
  email: string;
  referral_code: string;
  credit_balance: number;
  credit_per_order: number;
  is_active: boolean;
  created_at: string;
}

interface ReferralOrder {
  id: string;
  referral_user_id: string;
  order_id: string;
  credit_earned: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  referral_user?: { username: string };
  order?: {
    order_code: string;
    total_amount: number;
    customer_email: string;
    created_at: string;
  };
}

const ReferralManagement: React.FC = () => {
  const [referralUsers, setReferralUsers] = useState<ReferralUser[]>([]);
  const [referralOrders, setReferralOrders] = useState<ReferralOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<ReferralUser | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'orders'>('users');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    referral_code: '',
    credit_per_order: '50',
    is_active: true
  });

  useEffect(() => {
    fetchReferralUsers();
    fetchReferralOrders();
  }, []);

  const fetchReferralUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferralUsers(data || []);
    } catch (error) {
      console.error('Error fetching referral users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_orders')
        .select(`
          *,
          referral_user:referral_users(username),
          order:orders(order_code, total_amount, customer_email, created_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferralOrders(data || []);
    } catch (error) {
      console.error('Error fetching referral orders:', error);
    }
  };

  const generateReferralCode = () => {
    return 'REF-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      referral_code: '',
      credit_per_order: '50',
      is_active: true
    });
    setEditingUser(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if custom referral code is provided and validate it
    let finalReferralCode = formData.referral_code.trim();
    
    if (finalReferralCode) {
      // Validate custom referral code format
      if (!/^[A-Z0-9-_]{3,20}$/i.test(finalReferralCode)) {
        alert('Referral kod mora da sadrži samo slova, brojeve, crtice i podvlake (3-20 karaktera)');
        return;
      }
      
      // Check if custom referral code already exists (only if not editing the same user)
      try {
        const { data: existingCode, error } = await supabase
          .from('referral_users')
          .select('id')
          .eq('referral_code', finalReferralCode.toUpperCase())
          .single();

        if (!error && existingCode && (!editingUser || existingCode.id !== editingUser.id)) {
          alert('Ovaj referral kod već postoji. Molimo izaberite drugi.');
          return;
        }
      } catch (error) {
        // If no existing code found, that's good
      }
      
      finalReferralCode = finalReferralCode.toUpperCase();
    } else {
      // Generate automatic code if no custom code provided
      finalReferralCode = editingUser?.referral_code || generateReferralCode();
    }
    
    const userData = {
      username: formData.username,
      email: formData.email,
      password_hash: formData.password, // In production, hash this properly
      referral_code: finalReferralCode,
      credit_per_order: parseFloat(formData.credit_per_order),
      is_active: formData.is_active
    };

    try {
      if (editingUser) {
        const { error } = await supabase
          .from('referral_users')
          .update(userData)
          .eq('id', editingUser.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('referral_users')
          .insert(userData);
        
        if (error) throw error;
      }

      fetchReferralUsers();
      resetForm();
      alert('Referral korisnik je uspešno sačuvan!');
    } catch (error) {
      console.error('Error saving referral user:', error);
      alert('Greška pri čuvanju referral korisnika');
    }
  };

  const handleEdit = (user: ReferralUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't show password
      referral_code: user.referral_code,
      credit_per_order: user.credit_per_order.toString(),
      is_active: user.is_active
    });
    setShowAddForm(true);
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('referral_users')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) throw error;
      fetchReferralUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Greška pri menjanju statusa korisnika');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovog referral korisnika?')) return;

    try {
      const { error } = await supabase
        .from('referral_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      fetchReferralUsers();
    } catch (error) {
      console.error('Error deleting referral user:', error);
      alert('Greška pri brisanju referral korisnika');
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'approved' | 'rejected') => {
    try {
      const order = referralOrders.find(o => o.id === orderId);
      if (!order) return;

      const { error } = await supabase
        .from('referral_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      // If approved, add credit to user's balance
      if (status === 'approved') {
        try {
          // First get current balance
          const { data: userData, error: fetchError } = await supabase
            .from('referral_users')
            .select('credit_balance')
            .eq('id', order.referral_user_id)
            .single();

          if (fetchError) throw fetchError;

          if (userData) {
            const newBalance = userData.credit_balance + order.credit_earned;
            const { error: updateError } = await supabase
              .from('referral_users')
              .update({ credit_balance: newBalance })
              .eq('id', order.referral_user_id);

            if (updateError) throw updateError;
          }
        } catch (balanceError) {
          console.error('Error updating user balance:', balanceError);
        }
      }

      fetchReferralOrders();
      fetchReferralUsers();
      alert(`Porudžbina je uspešno ${status === 'approved' ? 'odobrena' : 'odbijena'}!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Greška pri ažuriranju statusa porudžbine');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Sistem</h2>
        <div className="flex space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Korisnici
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Porudžbine
            </button>
          </div>
          {activeTab === 'users' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj Korisnika</span>
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingUser ? 'Uredi Referral Korisnika' : 'Dodaj Novog Referral Korisnika'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Korisničko Ime
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lozinka
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required={!editingUser}
                placeholder={editingUser ? 'Ostavite prazno da zadržite postojeću' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Referral Kod (opciono)
              </label>
              <input
                type="text"
                value={formData.referral_code}
                onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono uppercase"
                placeholder="npr. MOJ-KOD-123"
                maxLength={20}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Ostavite prazno za automatski generisan kod. Samo slova, brojevi, crtice i podvlake (3-20 karaktera).
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kredit po Porudžbini (RSD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.credit_per_order}
                onChange={(e) => setFormData({ ...formData, credit_per_order: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="flex items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {formData.is_active ? 'Aktivan' : 'Neaktivan'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
              >
                Otkaži
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{editingUser ? 'Ažuriraj' : 'Dodaj'} Korisnika</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Korisnik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Referral Kod
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kredit Balans
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kredit po Porudžbini
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {referralUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                        {user.referral_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        {user.credit_balance.toFixed(0)} RSD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {user.credit_per_order.toFixed(0)} RSD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(user.id, user.is_active)}
                        className={`flex items-center space-x-2 ${
                          user.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                        }`}
                      >
                        {user.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                        <span className="text-sm">
                          {user.is_active ? 'Aktivan' : 'Neaktivan'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {referralUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nema referral korisnika. Dodajte prvog korisnika da počnete.</p>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Porudžbina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Referral Korisnik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vrednost Porudžbine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kredit Zarađen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {referralOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(order.created_at).toLocaleDateString('sr-RS')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white font-mono">
                          {(order as any).order?.order_code || 'N/A'}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {(order as any).order?.customer_email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {(order as any).referral_user?.username || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                      {(order as any).order?.total_amount ? `${(order as any).order.total_amount.toFixed(0)} RSD` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                      {order.credit_earned.toFixed(0)} RSD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status === 'pending' && <Clock className="w-3 h-3" />}
                        {order.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {order.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        <span>
                          {order.status === 'pending' ? 'Na čekanju' : 
                           order.status === 'approved' ? 'Odobreno' : 'Odbačeno'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'approved')}
                            className="bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Odobri
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'rejected')}
                            className="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Odbaci
                          </button>
                        </>
                      )}
                      {order.status !== 'pending' && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {order.status === 'approved' ? 'Odobreno' : 'Odbačeno'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {referralOrders.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nema referral porudžbina.</p>
              <p className="text-sm mt-2">Referral porudžbine će se pojaviti ovde kada kupci koriste referral kodove.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferralManagement;